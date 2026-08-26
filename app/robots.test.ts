import { afterEach, describe, expect, it, vi } from "vitest";

async function load(siteUrl: string) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  return (await import("./robots")).default;
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  vi.resetModules();
});

describe("robots", () => {
  it("allows the whole site and keeps crawlers out of the API routes", async () => {
    const robots = await load("https://circuit.example");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://circuit.example/sitemap.xml",
    });
  });

  it("points at the sitemap on the configured host, not a hardcoded one", async () => {
    const robots = await load("https://preview.circuit.example");

    expect(robots().sitemap).toBe(
      "https://preview.circuit.example/sitemap.xml",
    );
  });
});
