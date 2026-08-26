import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPost } from "@/test/fixtures";

const getPosts = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPosts }));

const { GET } = await import("./route");

beforeEach(() => {
  getPosts.mockResolvedValue([aPost()]);
});

describe("GET /api/posts", () => {
  it("returns the article listing as JSON", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        title: "Pixel 10 Pro review",
        slug: "pixel-10-pro-review",
        author: "Ananya Prasad",
        date: "2026-02-14",
        excerpt: "A week with Google's flagship.",
        coverImage: {
          url: "https://images.test/pixel.jpg",
          alt: "Pixel 10 Pro",
        },
      },
    ]);
  });

  it("omits the article body, which the listing never renders", async () => {
    getPosts.mockResolvedValue([
      aPost({ body: { nodeType: "document", data: {}, content: [] } as never }),
    ]);

    const [post] = await (await GET()).json();

    // The body is a full rich-text document per article. Polling it every
    // minute would send far more than the listing displays.
    expect(post).not.toHaveProperty("body");
  });

  it("returns an empty list when the CMS has no articles", async () => {
    getPosts.mockResolvedValue([]);

    await expect((await GET()).json()).resolves.toEqual([]);
  });

  it("returns an empty list rather than failing when the CMS is unreachable", async () => {
    // getPosts already degrades to [] via withFallback, so the endpoint
    // inherits that: a CMS outage leaves the open tab on its last good data.
    getPosts.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
  });
});
