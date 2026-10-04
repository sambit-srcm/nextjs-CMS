import { describe, expect, it } from "vitest";

import { isExternalHref, safeHref } from "@/lib/safe-href";

describe("safeHref", () => {
  it.each([
    "https://example.com/review",
    "http://example.com",
    "mailto:editor@example.com",
    "tel:+15551234567",
    "/blog/pixel-10-pro-review",
    "#specs",
  ])("keeps the safe link %s", (uri) => {
    expect(safeHref(uri)).toBe(uri);
  });

  it("trims surrounding whitespace", () => {
    expect(safeHref("  https://example.com  ")).toBe("https://example.com");
  });

  it.each([
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.example.com",
    "not a url",
    "",
    "   ",
    undefined,
    null,
    42,
  ])("drops the unsafe or invalid link %p", (uri) => {
    expect(safeHref(uri)).toBeNull();
  });
});

describe("isExternalHref", () => {
  it("is true only for absolute http(s) links", () => {
    expect(isExternalHref("https://example.com")).toBe(true);
    expect(isExternalHref("HTTP://example.com")).toBe(true);
    expect(isExternalHref("/blog")).toBe(false);
    expect(isExternalHref("mailto:a@b.co")).toBe(false);
  });
});
