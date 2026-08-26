import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * `siteUrl` is resolved once at module load, so each case re-imports the
 * module with a fresh environment rather than mutating an already-read value.
 */
async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import("./site-url");
}

const ORIGINAL = { ...process.env };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("siteUrl", () => {
  it("prefers the explicitly configured origin", async () => {
    const { siteUrl } = await load({
      NEXT_PUBLIC_SITE_URL: "https://circuit.example",
      VERCEL_PROJECT_PRODUCTION_URL: "ignored.vercel.app",
    });

    expect(siteUrl).toBe("https://circuit.example");
  });

  it("falls back to the Vercel production host", async () => {
    const { siteUrl } = await load({
      VERCEL_PROJECT_PRODUCTION_URL: "circuit.vercel.app",
    });

    expect(siteUrl).toBe("https://circuit.vercel.app");
  });

  it("falls back to localhost rather than throwing", async () => {
    const { siteUrl } = await load({});

    expect(siteUrl).toBe("http://localhost:3000");
  });

  it("strips trailing slashes so paths concatenate cleanly", async () => {
    const { siteUrl } = await load({
      NEXT_PUBLIC_SITE_URL: "https://circuit.example//",
    });

    expect(siteUrl).toBe("https://circuit.example");
  });
});

describe("absoluteUrl", () => {
  it("resolves a site-relative path against the origin", async () => {
    const { absoluteUrl } = await load({
      NEXT_PUBLIC_SITE_URL: "https://circuit.example",
    });

    expect(absoluteUrl("/")).toBe("https://circuit.example/");
    expect(absoluteUrl("/blog/pixel-10-pro-review")).toBe(
      "https://circuit.example/blog/pixel-10-pro-review",
    );
  });
});
