import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CmsError } from "@/lib/cms/errors";

const createContactSubmission = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/submissions", () => ({ createContactSubmission }));

const { POST } = await import("./route");

function post(body: unknown, raw?: string) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to discuss a project.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    createContactSubmission.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("records a valid submission and returns ok", async () => {
    createContactSubmission.mockResolvedValue({ id: "entry-123" });

    const res = await POST(post(valid));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(createContactSubmission).toHaveBeenCalledWith(valid);
  });

  it("passes trimmed values through to the CMS, not the raw input", async () => {
    createContactSubmission.mockResolvedValue({ id: "entry-123" });

    await POST(post({ ...valid, name: "  Ada Lovelace  " }));

    expect(createContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Lovelace" }),
    );
  });

  it("rejects a malformed JSON body", async () => {
    const res = await POST(post(null, "not-json"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid request body." });
    expect(createContactSubmission).not.toHaveBeenCalled();
  });

  it("returns field-level errors for invalid input", async () => {
    const res = await POST(post({ name: "", email: "nope", message: "" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fields).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      message: expect.any(String),
    });
    expect(createContactSubmission).not.toHaveBeenCalled();
  });

  it("never reaches the CMS when validation fails", async () => {
    await POST(post({ ...valid, email: "nope" }));
    await POST(post({ ...valid, name: "x".repeat(101) }));

    expect(createContactSubmission).not.toHaveBeenCalled();
  });

  it("returns 502 when the CMS write fails", async () => {
    createContactSubmission.mockRejectedValue(
      new CmsError("CONTENTFUL_MANAGEMENT_TOKEN is not set; cannot record."),
    );

    const res = await POST(post(valid));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: "Could not send your message. Please try again later.",
    });
  });

  it("does not leak the upstream reason in the response body", async () => {
    createContactSubmission.mockRejectedValue(
      new CmsError("Contentful rejected the submission (401): bad token"),
    );

    const res = await POST(post(valid));
    const body = JSON.stringify(await res.json());

    expect(body).not.toContain("401");
    expect(body).not.toContain("token");
    expect(body).not.toContain("Contentful");
  });

  it("still returns 502 for a non-CmsError failure", async () => {
    // The catch has to cope with anything the write path throws, not only the
    // typed error — a TypeError from a bad response shape, for instance.
    createContactSubmission.mockRejectedValue(new TypeError("unexpected"));

    const res = await POST(post(valid));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: "Could not send your message. Please try again later.",
    });
  });

  it("logs the upstream reason server-side", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createContactSubmission.mockRejectedValue(
      new CmsError("Contentful rejected the submission (401): bad token"),
    );

    await POST(post(valid));

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("401"),
      expect.anything(),
    );
  });
});
