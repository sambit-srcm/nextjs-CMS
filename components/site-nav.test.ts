import { describe, expect, it } from "vitest";

import { isActive, NAV_LINKS } from "./site-nav";

describe("NAV_LINKS", () => {
  it("starts at home and has unique hrefs", () => {
    expect(NAV_LINKS[0].href).toBe("/");
    expect(new Set(NAV_LINKS.map((l) => l.href)).size).toBe(NAV_LINKS.length);
  });

  it("every link is an absolute in-app path", () => {
    for (const link of NAV_LINKS) {
      expect(link.href.startsWith("/")).toBe(true);
      expect(link.label.length).toBeGreaterThan(0);
    }
  });
});

describe("isActive", () => {
  it("matches home only exactly", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/blog", "/")).toBe(false);
    // The bug a prefix test would cause: home lit on every page.
    expect(isActive("/about", "/")).toBe(false);
  });

  it("matches a section exactly", () => {
    expect(isActive("/blog", "/blog")).toBe(true);
  });

  it("keeps a section active on its child routes", () => {
    expect(isActive("/blog/pixel-10-pro-review", "/blog")).toBe(true);
    expect(isActive("/team/ananya-prasad", "/team")).toBe(true);
  });

  it("matches on a path prefix, so a sibling sharing a stem also matches", () => {
    // Documenting a real limitation rather than asserting it is desirable:
    // /services-archive would light /services. Harmless with the current
    // routes, and worth knowing before adding one.
    expect(isActive("/services-archive", "/services")).toBe(true);
  });

  it("does not match an unrelated section", () => {
    expect(isActive("/services", "/blog")).toBe(false);
  });
});
