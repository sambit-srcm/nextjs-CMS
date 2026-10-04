import { describe, expect, it, vi } from "vitest";

import { render, text } from "@/test/render";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({ usePathname }));

const { SiteHeader } = await import("@/components/site-header");
const { NAV_LINKS } = await import("@/components/site-nav");

const header = () =>
  render(<SiteHeader siteName="Circuit" siteTagline="Phones & Tech" />);

/** Opening `<a>` tags for an href (Home appears twice). */
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
    // Decorative: the site name is right next to it.
    expect(html).toContain('alt=""');
    expect(text(html)).toContain("Circuit");
  });

  it("centres the logo against the text rather than baselining it", () => {
    usePathname.mockReturnValue("/");
    const html = render(
      <SiteHeader
        siteName="Circuit"
        siteTagline="Phones & Tech"
        logo={{ url: "https://images.test/logo.jpg", alt: "" }}
      />,
    );

    const brand = html.slice(html.indexOf('href="/"') - 200);

    // Images have no text baseline, so the logo row is centred instead.
    expect(brand).toContain("flex items-center gap-2.5");
    expect(brand).toContain("flex items-baseline gap-2.5");
    const logoAt = brand.indexOf("<img");
    const baselineAt = brand.indexOf("items-baseline");
    expect(logoAt).toBeLessThan(baselineAt);
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
