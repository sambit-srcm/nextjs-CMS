import { beforeEach, describe, expect, it, vi } from "vitest";

import { aMember, aPost } from "@/test/fixtures";

const getPosts = vi.fn();
const getTeam = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPosts, getTeam }));
vi.mock("@/lib/site-url", () => ({
  siteUrl: "https://circuit.example",
  absoluteUrl: (path: string) => `https://circuit.example${path}`,
}));

const { default: sitemap } = await import("./sitemap");

beforeEach(() => {
  getPosts.mockResolvedValue([aPost({ slug: "pixel", date: "2026-02-14" })]);
  getTeam.mockResolvedValue([aMember({ id: "ananya-prasad" })]);
});

const urls = async () => (await sitemap()).map((entry) => entry.url);

describe("sitemap", () => {
  it("lists every static route", async () => {
    expect(await urls()).toEqual(
      expect.arrayContaining([
        "https://circuit.example/",
        "https://circuit.example/about",
        "https://circuit.example/services",
        "https://circuit.example/blog",
        "https://circuit.example/contact",
      ]),
    );
  });

  it("gives the home page the highest priority", async () => {
    const [home] = await sitemap();

    expect(home).toMatchObject({
      url: "https://circuit.example/",
      priority: 1,
    });
  });

  it("includes an entry per article, dated from its publish date", async () => {
    const entry = (await sitemap()).find((item) =>
      item.url.endsWith("/blog/pixel"),
    );

    expect(entry).toMatchObject({
      url: "https://circuit.example/blog/pixel",
      lastModified: new Date("2026-02-14"),
    });
  });

  it("omits lastModified for an article with no date", async () => {
    getPosts.mockResolvedValue([aPost({ slug: "undated", date: "" })]);

    const entry = (await sitemap()).find((item) =>
      item.url.endsWith("/blog/undated"),
    );

    expect(entry?.lastModified).toBeUndefined();
  });

  it("includes an entry per writer", async () => {
    expect(await urls()).toContain(
      "https://circuit.example/team/ananya-prasad",
    );
  });

  it("still lists the static routes when the CMS is unreachable", async () => {
    getPosts.mockResolvedValue([]);
    getTeam.mockResolvedValue([]);

    expect(await urls()).toHaveLength(5);
  });
});
