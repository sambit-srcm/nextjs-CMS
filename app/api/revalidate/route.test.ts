import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("./route");

const SECRET = "test-webhook-secret";

function post(body: unknown, secret?: string, raw?: string) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "x-contentful-webhook-secret": secret } : {}),
    },
    body: raw ?? JSON.stringify(body),
  });
}

const publishEvent = { sys: { contentType: { sys: { id: "blogPost" } } } };

beforeEach(() => {
  revalidateTag.mockReset();
  vi.stubEnv("CONTENTFUL_REVALIDATE_SECRET", SECRET);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/revalidate", () => {
  it("purges the tag named by the payload content type", async () => {
    const res = await POST(post(publishEvent, SECRET));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ revalidated: "blogPost" });
    expect(revalidateTag).toHaveBeenCalledWith("blogPost", "max");
  });

  it("refuses when no secret is configured, rather than revalidating openly", async () => {
    vi.stubEnv("CONTENTFUL_REVALIDATE_SECRET", "");

    const res = await POST(post(publishEvent, SECRET));

    expect(res.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a request with no secret header", async () => {
    const res = await POST(post(publishEvent));

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret", async () => {
    const res = await POST(post(publishEvent, "not-the-secret"));

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a malformed body", async () => {
    const res = await POST(post(null, SECRET, "not-json"));

    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a payload that names no content type", async () => {
    const res = await POST(post({ sys: {} }, SECRET));

    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("authorises before parsing, so an unauthorised body is never read", async () => {
    const res = await POST(post(null, undefined, "not-json"));

    expect(res.status).toBe(401);
  });
});
