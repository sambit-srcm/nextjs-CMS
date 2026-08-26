import { describe, expect, it } from "vitest";

import type { BlogPost } from "@/lib/cms/types";
import { filterPosts } from "./filter-posts";

const post = (over: Partial<BlogPost>): BlogPost => ({
  title: "Pixel 10 Pro review",
  slug: "pixel-10-pro-review",
  author: "Ananya Prasad",
  date: "2026-08-19",
  excerpt: "The camera still carries it.",
  coverImage: null,
  body: null,
  ...over,
});

const posts = [
  post({}),
  post({ title: "iPhone 18 Pro", slug: "iphone", author: "Marcus Feld", excerpt: "Three weeks in." }),
  post({ title: "MWC 2026 preview", slug: "mwc", author: "Priya Raman", excerpt: "Foldables move down-market." }),
];

describe("filterPosts", () => {
  it("returns everything for an empty query", () => {
    expect(filterPosts(posts, "")).toHaveLength(3);
  });

  it("returns everything for a whitespace-only query", () => {
    expect(filterPosts(posts, "   ")).toHaveLength(3);
  });

  it("matches on title", () => {
    expect(filterPosts(posts, "iPhone").map((p) => p.slug)).toEqual(["iphone"]);
  });

  it("matches on author", () => {
    expect(filterPosts(posts, "Priya").map((p) => p.slug)).toEqual(["mwc"]);
  });

  it("matches on excerpt", () => {
    expect(filterPosts(posts, "foldables").map((p) => p.slug)).toEqual(["mwc"]);
  });

  it("ignores case", () => {
    expect(filterPosts(posts, "PIXEL")).toHaveLength(1);
    expect(filterPosts(posts, "pixel")).toHaveLength(1);
  });

  it("requires every term, so a second word narrows the result", () => {
    // "pro" alone matches two articles; adding "pixel" must cut it to one.
    expect(filterPosts(posts, "pro").length).toBe(2);
    expect(filterPosts(posts, "pixel pro").map((p) => p.slug)).toEqual([
      "pixel-10-pro-review",
    ]);
  });

  it("matches terms drawn from different fields", () => {
    // "marcus" is the author, "weeks" is in the excerpt.
    expect(filterPosts(posts, "marcus weeks").map((p) => p.slug)).toEqual([
      "iphone",
    ]);
  });

  it("returns nothing when a term matches no article", () => {
    expect(filterPosts(posts, "pixel nonsense")).toEqual([]);
  });

  it("collapses repeated whitespace between terms", () => {
    expect(filterPosts(posts, "  pixel   pro  ")).toHaveLength(1);
  });
});
