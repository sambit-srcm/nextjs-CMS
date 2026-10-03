import { afterEach, describe, expect, it, vi } from "vitest";

import {
  failureNotice,
  messageDescribedBy,
  submitContact,
} from "@/app/contact/submit-contact";

const formData = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

const message = { name: "Ada", email: "ada@example.com", message: "Hello" };

const respondWith = (response: Response) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

afterEach(() => vi.restoreAllMocks());

describe("failureNotice", () => {
  const fallback = "Something went wrong.";
  const failure = {
    ok: false as const,
    status: 500,
    fieldErrors: {},
    message: "nope",
  };

  it("stays quiet when a field already explains the problem", () => {
    expect(
      failureNotice(
        { ...failure, status: 400, fieldErrors: { email: "Invalid email" } },
        fallback,
      ),
    ).toBeNull();
  });

  it("uses the server's sentence for a rate limit or an oversized body", () => {
    expect(
      failureNotice(
        { ...failure, status: 429, message: "Too many messages." },
        fallback,
      ),
    ).toBe("Too many messages.");
    expect(
      failureNotice(
        { ...failure, status: 413, message: "Message is too large." },
        fallback,
      ),
    ).toBe("Message is too large.");
  });

  it("falls back when a rate limit has no sentence", () => {
    expect(
      failureNotice({ ...failure, status: 429, message: undefined }, fallback),
    ).toBe(fallback);
  });

  it("uses the CMS fallback for any other failure", () => {
    expect(failureNotice(failure, fallback)).toBe(fallback);
  });
});

describe("messageDescribedBy", () => {
  it("points at the counter, and at the error once there is one", () => {
    expect(messageDescribedBy()).toBe("message-count");
    expect(messageDescribedBy("Too long")).toBe("message-error message-count");
  });
});

describe("submitContact", () => {
  it("posts the fields, including the empty spam trap, as JSON", async () => {
    const fetchSpy = respondWith(Response.json({ ok: true }));

    await submitContact(formData({ ...message, website: "" }));

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init?.body as string)).toEqual({
      ...message,
      website: "",
    });
  });

  it("trims the fields before sending, and leaves the spam trap alone", async () => {
    const fetchSpy = respondWith(Response.json({ ok: true }));

    await submitContact(
      formData({
        name: "  Ada  ",
        email: " ada@example.com ",
        message: " Hello ",
        website: "  ",
      }),
    );

    expect(JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)).toEqual({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      website: "  ",
    });
  });

  it("reports success", async () => {
    respondWith(Response.json({ ok: true }));

    await expect(submitContact(formData(message))).resolves.toEqual({
      ok: true,
    });
  });

  it("passes on the server's field errors", async () => {
    respondWith(
      Response.json(
        { error: "Please correct…", fields: { email: "Invalid email" } },
        { status: 400 },
      ),
    );

    await expect(submitContact(formData(message))).resolves.toEqual({
      ok: false,
      status: 400,
      fieldErrors: { email: "Invalid email" },
      message: "Please correct…",
    });
  });

  it("copes with an error response that isn't JSON", async () => {
    respondWith(new Response("Bad gateway", { status: 502 }));

    await expect(submitContact(formData(message))).resolves.toEqual({
      ok: false,
      status: 502,
      fieldErrors: {},
      message: undefined,
    });
  });

  it("sends an empty string when a field is missing", async () => {
    const fetchSpy = respondWith(Response.json({ ok: true }));

    await submitContact(formData({ email: "ada@example.com" }));

    expect(JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)).toMatchObject(
      { name: "", message: "" },
    );
  });

  it("throws when the network request itself fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    await expect(submitContact(formData(message))).rejects.toThrow("offline");
  });
});
