import { describe, expect, it } from "vitest";

import { formatDate } from "./format";

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
