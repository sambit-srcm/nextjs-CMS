import { describe, expect, it } from "vitest";

import { contactSubmissionSchema, toFieldErrors } from "./contact";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to discuss a project.",
};

describe("contactSubmissionSchema", () => {
  it("accepts a well-formed submission", () => {
    const result = contactSubmissionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = contactSubmissionSchema.safeParse({
      ...valid,
      name: "  Ada Lovelace  ",
      message: "\n  Hello  \n",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "Ada Lovelace",
      message: "Hello",
    });
  });

  it("rejects whitespace-only fields, which trim reduces to empty", () => {
    const result = contactSubmissionSchema.safeParse({ ...valid, name: "   " });

    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!).name).toBe("Name is required.");
  });

  it.each([
    ["missing @", "nope"],
    ["missing domain", "ada@"],
    ["missing local part", "@example.com"],
    ["contains a space", "ada lovelace@example.com"],
  ])("rejects an email %s", (_label, email) => {
    const result = contactSubmissionSchema.safeParse({ ...valid, email });

    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!).email).toBe(
      "Please provide a valid email address.",
    );
  });

  it("accepts addresses that stricter patterns wrongly reject", () => {
    for (const email of [
      "ada+newsletter@example.co.uk",
      "first.last@sub.domain.example",
      "a@b.co",
    ]) {
      expect(contactSubmissionSchema.safeParse({ ...valid, email }).success).toBe(
        true,
      );
    }
  });

  it.each([
    ["name", 101, "Name must be 100 characters or fewer."],
    ["message", 5001, "Message must be 5000 characters or fewer."],
  ])("rejects an over-length %s", (field, length, expected) => {
    const result = contactSubmissionSchema.safeParse({
      ...valid,
      [field]: "x".repeat(length),
    });

    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!)[field as "name" | "message"]).toBe(
      expected,
    );
  });

  it("accepts a field exactly on the limit", () => {
    const result = contactSubmissionSchema.safeParse({
      ...valid,
      name: "x".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it.each([null, undefined, "a string", 42, []])(
    "rejects a non-object payload: %s",
    (payload) => {
      expect(contactSubmissionSchema.safeParse(payload).success).toBe(false);
    },
  );

  it("reports every invalid field at once, not just the first", () => {
    const result = contactSubmissionSchema.safeParse({
      name: "",
      email: "nope",
      message: "",
    });

    expect(result.success).toBe(false);
    const errors = toFieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });
});
