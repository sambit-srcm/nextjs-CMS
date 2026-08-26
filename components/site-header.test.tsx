import { describe, expect, it, vi } from "vitest";

import { render, text } from "@/test/render";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({ usePathname }));

const { SiteHeader } = await import("./site-header");
const { NAV_LINKS } = await import("./site-nav");

const header = () =>
  render(<SiteHeader siteName="Circuit" siteTagline="Phones & Tech" />);

/**
 * The opening `<a>` tags for one href. React does not guarantee attribute
 * order, so assertions read the whole tag rather than a positional match.
 * Home appears twice — the brand link and the nav link — hence a list.
 */
function anchors(html: string, href: string): string[] {
  return html
    .split("<a ")
    .slice(1)
    .map((rest) => rest.slice(0, rest.indexOf(">")))
    .filter((tag) => tag.includes(`href="${href}"`));
}

const marksCurrent = (html: string, href: string) =>
  anchors(html, href).some((tag) => tag.includes('aria-current="page"'));

describe("SiteHeader", () => {
  it("renders the brand and links every primary section", () => {
    usePathname.mockReturnValue("/");
    const html = header();

    expect(text(html)).toContain("Circuit");
    expect(text(html)).toContain("Phones & Tech");
    for (const link of NAV_LINKS) {
      expect(anchors(html, link.href).length).toBeGreaterThan(0);
    }
  });

  it("marks the current section for assistive tech", () => {
    usePathname.mockReturnValue("/blog");
    const html = header();

    expect(marksCurrent(html, "/blog")).toBe(true);
    expect(marksCurrent(html, "/about")).toBe(false);
  });

  it("keeps a child route inside its section", () => {
    usePathname.mockReturnValue("/blog/pixel-10-pro-review");

    expect(marksCurrent(header(), "/blog")).toBe(true);
  });

  it("matches home exactly, so it is not active on every page", () => {
    usePathname.mockReturnValue("/services");
    const html = header();

    expect(marksCurrent(html, "/")).toBe(false);
    expect(marksCurrent(html, "/services")).toBe(true);
  });

  it("starts with the mobile menu closed", () => {
    usePathname.mockReturnValue("/");
    const html = header();

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Open menu"');
    expect(html).not.toContain('id="mobile-nav"');
  });

  it("renders the CMS logo beside the wordmark", () => {
    usePathname.mockReturnValue("/");
    const html = render(
      <SiteHeader
        siteName="Circuit"
        siteTagline="Phones & Tech"
        logo={{ url: "https://images.test/logo.jpg", alt: "" }}
      />,
    );

    expect(html).toContain("logo.jpg");
    // Decorative: the wordmark next to it already names the site, and the
    // link would otherwise be announced twice.
    expect(html).toContain('alt=""');
    expect(text(html)).toContain("Circuit");
  });

  it("falls back to the wordmark alone when no logo is set", () => {
    usePathname.mockReturnValue("/");
    const html = header();

    expect(html).not.toContain("<img");
    expect(text(html)).toContain("Circuit");
  });

  it("ships the theme toggle in the header", () => {
    usePathname.mockReturnValue("/");

    expect(header()).toContain("theme-icon-dark");
  });
});
