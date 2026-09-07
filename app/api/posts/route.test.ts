import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPost } from "@/test/fixtures";

const getPostsOrThrow = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPostsOrThrow }));

const { GET } = await import("./route");

beforeEach(() => {
  getPostsOrThrow.mockResolvedValue([aPost()]);
  vi.spyOn(console, "error").mockImplementation(() => {});
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
      },
    ]);
  });

  it("omits the fields the listing never renders", async () => {
    getPostsOrThrow.mockResolvedValue([
      aPost({ body: { nodeType: "document", data: {}, content: [] } as never }),
    ]);

    const [post] = await (await GET()).json();

    // The body is a full rich-text document per article and the cover image
    // is only shown on the article page. Polling either every minute would
    // send far more than the listing displays.
    expect(post).not.toHaveProperty("body");
    expect(post).not.toHaveProperty("coverImage");
  });

  it("returns an empty list when the CMS has no articles", async () => {
    getPostsOrThrow.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });

  it("fails with 503 when the CMS is unreachable", async () => {
    getPostsOrThrow.mockRejectedValue(new Error("Contentful responded 500"));

    const response = await GET();

    // Not a 200 with an empty list. The page treats a successful response as
    // the current set of articles, so degrading here would replace a list the
    // reader can already see with an empty state.
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Could not reach the article list.",
    });
  });

  it("logs the reason a refresh failed", async () => {
    const cause = new Error("Contentful responded 401");
    getPostsOrThrow.mockRejectedValue(cause);

    await GET();

    expect(console.error).toHaveBeenCalledWith(
      "Blog listing refresh failed",
      cause,
    );
  });
});
