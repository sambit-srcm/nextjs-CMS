import { describe, expect, it } from "vitest";

import { formatDate, initials } from "./format";

describe("formatDate", () => {
  it("formats an ISO date in long British form", () => {
    expect(formatDate("2026-08-19")).toBe("19 August 2026");
  });

  it("formats a full timestamp", () => {
    expect(formatDate("2026-01-05T13:45:00.000Z")).toBe("5 January 2026");
  });

  it("returns null for an empty string rather than Invalid Date", () => {
    expect(formatDate("")).toBeNull();
  });
});

describe("initials", () => {
  it("takes the first letter of each word", () => {
    expect(initials("Marcus Feld")).toBe("MF");
  });

  it("handles a single name", () => {
    expect(initials("Priya")).toBe("P");
  });

  it("handles three or more words", () => {
    expect(initials("Ana Maria Silva Costa")).toBe("AMSC");
  });
});
