import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CmsError } from "@/lib/cms/errors";
import { contactRateLimit } from "@/lib/rate-limit";

const createContactSubmission = vi.hoisted(() => vi.fn());

vi.mock("@/lib/cms/submissions", () => ({ createContactSubmission }));

const { POST } = await import("@/app/api/contact/route");

function post(
  body: unknown,
  raw?: string,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
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
    contactRateLimit.reset();
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
    await expect(res.json()).resolves.toEqual({
      error: "Invalid request body.",
    });
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
    // Any thrown error, not just CmsError, must give a 502.
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

  describe("abuse protection", () => {
    it("refuses a body that isn't JSON (e.g. a form on another site)", async () => {
      const res = await POST(
        post(null, "name=x", { "Content-Type": "text/plain" }),
      );

      expect(res.status).toBe(415);
      expect(createContactSubmission).not.toHaveBeenCalled();
    });

    it("refuses a request sent from another site's page", async () => {
      const res = await POST(
        post(valid, undefined, { Origin: "https://evil.example.com" }),
      );

      expect(res.status).toBe(403);
      expect(createContactSubmission).not.toHaveBeenCalled();
    });

    it("refuses a malformed Origin instead of throwing", async () => {
      const res = await POST(post(valid, undefined, { Origin: "not a url" }));

      expect(res.status).toBe(403);
      expect(createContactSubmission).not.toHaveBeenCalled();
    });

    it("accepts a request from this site's own pages", async () => {
      createContactSubmission.mockResolvedValue({ id: "entry-123" });

      const res = await POST(
        post(valid, undefined, { Origin: "http://localhost" }),
      );

      expect(res.status).toBe(200);
    });

    it("refuses an oversized body, by header or by actual size", async () => {
      const big = JSON.stringify({ ...valid, message: "a".repeat(20_000) });

      const declared = await POST(
        post(null, big, { "Content-Length": String(big.length) }),
      );
      const undeclared = await POST(post(null, big));

      expect(declared.status).toBe(413);
      expect(undeclared.status).toBe(413);
      expect(createContactSubmission).not.toHaveBeenCalled();
    });

    it("pretends to accept a bot that filled the spam trap, but saves nothing", async () => {
      const res = await POST(
        post({ ...valid, website: "http://spam.example" }),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
      expect(createContactSubmission).not.toHaveBeenCalled();
    });

    it("allows 5 messages per sender, then answers 429 with Retry-After", async () => {
      createContactSubmission.mockResolvedValue({ id: "entry-123" });
      const from = (ip: string) =>
        POST(post(valid, undefined, { "X-Forwarded-For": `${ip}, 10.0.0.1` }));

      for (let i = 0; i < 5; i++) {
        expect((await from("203.0.113.7")).status).toBe(200);
      }
      const blocked = await from("203.0.113.7");

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
      // a different sender is unaffected
      expect((await from("198.51.100.2")).status).toBe(200);
    });
  });
});
