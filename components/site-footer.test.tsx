import { describe, expect, it } from "vitest";

import { render, text } from "@/test/render";

import { SiteFooter } from "./site-footer";
import { NAV_LINKS } from "./site-nav";

describe("SiteFooter", () => {
  it("renders the brand strings it is given", () => {
    const body = text(
      render(<SiteFooter siteName="Circuit" footerTagline="Independent reviews." />),
    );

    expect(body).toContain("Circuit");
    expect(body).toContain("Independent reviews.");
  });

  it("links every primary section, so the two navs cannot drift", () => {
    const html = render(<SiteFooter siteName="Circuit" footerTagline="x" />);

    for (const link of NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
      expect(text(html)).toContain(link.label);
    }
  });

  it("stamps the current year into the copyright line", () => {
    const html = render(<SiteFooter siteName="Circuit" footerTagline="x" />);

    expect(text(html)).toContain(String(new Date().getFullYear()));
  });
});
