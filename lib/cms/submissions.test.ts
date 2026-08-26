import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CmsError } from "./errors";
import { createContactSubmission } from "./submissions";

const submission = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Interested in a device test.",
};

function ok(body: unknown) {
  return { ok: true, status: 201, json: async () => body, text: async () => "" } as Response;
}
function fail(status: number, body: string) {
  return { ok: false, status, json: async () => ({}), text: async () => body } as Response;
}

beforeEach(() => {
  vi.stubEnv("CONTENTFUL_MANAGEMENT_TOKEN", "test-management-token");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("createContactSubmission", () => {
  it("returns the created entry id", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ sys: { id: "entry-1" } })));
    await expect(createContactSubmission(submission)).resolves.toEqual({ id: "entry-1" });
  });

  it("posts to the management API with the content type header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ sys: { id: "entry-1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await createContactSubmission(submission);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("api.contentful.com");
    expect(init.method).toBe("POST");
    expect(init.headers["X-Contentful-Content-Type"]).toBe("contactSubmission");
    expect(init.headers.Authorization).toBe("Bearer test-management-token");
  });

  it("sends the fields wrapped in the locale envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ sys: { id: "entry-1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await createContactSubmission(submission);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.fields.name).toEqual({ "en-US": "Ada Lovelace" });
    expect(body.fields.email).toEqual({ "en-US": "ada@example.com" });
    expect(body.fields.submittedAt["en-US"]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("never publishes the entry, so submissions stay off the delivery API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ sys: { id: "entry-1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await createContactSubmission(submission);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).not.toContain("/published");
  });

  it("throws a CmsError naming the variable when the token is absent", async () => {
    vi.stubEnv("CONTENTFUL_MANAGEMENT_TOKEN", "");
    vi.stubGlobal("fetch", vi.fn());

    await expect(createContactSubmission(submission)).rejects.toThrow(CmsError);
    await expect(createContactSubmission(submission)).rejects.toThrow(
      /CONTENTFUL_MANAGEMENT_TOKEN/,
    );
  });

  it("does not call the API at all when the token is absent", async () => {
    vi.stubEnv("CONTENTFUL_MANAGEMENT_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(createContactSubmission(submission)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws with the upstream status and body when Contentful rejects it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fail(422, "validation failed")));

    const attempt = createContactSubmission(submission);

    // Both halves matter: the status says what happened, the body says why.
    await expect(attempt).rejects.toThrow("422");
    await expect(attempt).rejects.toThrow("validation failed");
  });
});
