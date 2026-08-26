import { beforeEach, describe, expect, it, vi } from "vitest";

import { aSiteSettings } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getSiteSettings = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getSiteSettings }));

// `next/font/google` is a build-time transform, not a runtime module; it only
// has to hand back the CSS variable the layout interpolates.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const { default: RootLayout, generateMetadata } = await import("./layout");

beforeEach(() => {
  getSiteSettings.mockResolvedValue(aSiteSettings());
});

// The root layout takes `params` alongside `children`, even though it has none.
const layout = (children: React.ReactNode) =>
  RootLayout({ children, params: Promise.resolve({}) });

describe("generateMetadata", () => {
  it("takes the document title and description from the CMS", async () => {
    await expect(generateMetadata()).resolves.toEqual({
      title: "Circuit",
      description: "Reviews across Android and iOS.",
    });
  });

  it("falls back to the brand defaults when the CMS is unreachable", async () => {
    getSiteSettings.mockResolvedValue(null);

    const meta = await generateMetadata();

    expect(meta.title).toBe("Circuit");
    expect(meta.description).toBe(
      "Phone reviews and launch coverage across Android and iOS.",
    );
  });

  it("falls back rather than shipping an empty title", async () => {
    getSiteSettings.mockResolvedValue(
      aSiteSettings({ siteName: "", metaDescription: "" }),
    );

    const meta = await generateMetadata();

    expect(meta.title).toBe("Circuit");
    expect(meta.description).toContain("Phone reviews");
  });
});

describe("RootLayout", () => {
  it("wraps the page in the site chrome", async () => {
    const html = render(await layout(<main>Page body</main>));

    expect(html).toContain("<header");
    expect(text(html)).toContain("Page body");
    expect(html).toContain("<footer");
  });

  it("applies the theme before paint rather than in an effect", async () => {
    const html = render(await layout(null));

    // Inline in <head> so the stored palette is applied on the first frame.
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('localStorage.getItem("theme")');
  });

  it("passes the CMS brand strings to the header and footer", async () => {
    const body = text(render(await layout(null)));

    expect(body).toContain("Circuit");
    expect(body).toContain("Phones & Tech");
    expect(body).toContain("Independent phone reviews.");
  });

  it("uses the fallback brand strings when settings are unavailable", async () => {
    getSiteSettings.mockResolvedValue(null);

    const body = text(render(await layout(null)));

    expect(body).toContain("Circuit");
    expect(body).toContain("Independent phone reviews and launch coverage.");
  });
});
