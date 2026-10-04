import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPost, aRichTextBody } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPostBySlug = vi.fn();
const getPosts = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPostBySlug, getPosts }));

// Throw a named error in place of Next's internal notFound signal.
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const {
  default: Article,
  generateMetadata,
  generateStaticParams,
} = await import("@/app/blog/[slug]/page");

// Same shape Next passes: both are promises.
const params = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

beforeEach(() => {
  getPostBySlug.mockResolvedValue(aPost());
  getPosts.mockResolvedValue([aPost()]);
});

describe("generateStaticParams", () => {
  it("returns a slug for every published article", async () => {
    getPosts.mockResolvedValue([
      aPost({ slug: "pixel" }),
      aPost({ slug: "iphone" }),
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "pixel" },
      { slug: "iphone" },
    ]);
  });
});

describe("generateMetadata", () => {
  it("describes the article and its social card", async () => {
    const meta = await generateMetadata(params("pixel-10-pro-review"));

    expect(meta.title).toBe("Pixel 10 Pro review");
    expect(meta.description).toBe("A week with Google's flagship.");
    expect(meta.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-02-14",
      authors: ["Ananya Prasad"],
      images: [{ url: "https://images.test/pixel.jpg" }],
    });
  });

  it("leaves the author and image off when the article has neither", async () => {
    getPostBySlug.mockResolvedValue(aPost({ author: "", coverImage: null }));

    const meta = await generateMetadata(params("pixel-10-pro-review"));

    expect(meta.openGraph).toMatchObject({
      authors: undefined,
      images: undefined,
    });
  });

  it("falls back to a not-found title for an unknown slug", async () => {
    getPostBySlug.mockResolvedValue(null);

    await expect(generateMetadata(params("nope"))).resolves.toEqual({
      title: "Post not found",
    });
  });
});

describe("Article page", () => {
  it("renders the title, byline and formatted date", async () => {
    const body = text(render(await Article(params("pixel-10-pro-review"))));

    expect(body).toContain("Pixel 10 Pro review");
    expect(body).toContain("Ananya Prasad");
    expect(body).toContain("February 14, 2026");
  });

  it("maps every rich-text mark and block onto the site typography", async () => {
    getPostBySlug.mockResolvedValue(aPost({ body: aRichTextBody() }));

    const html = render(await Article(params("pixel-10-pro-review")));

    expect(html).toContain("<strong");
    expect(html).toContain("<code");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<ul");
    expect(html).toContain("<blockquote");
    expect(text(html)).toContain("Best in class.");
  });

  it("falls back to the excerpt when the body is empty", async () => {
    const html = render(await Article(params("pixel-10-pro-review")));

    expect(text(html)).toContain("A week with Google's flagship.");
    expect(html).not.toContain("<blockquote");
  });

  it("renders the cover image, and omits it when there is none", async () => {
    expect(render(await Article(params("x")))).toContain("pixel.jpg");

    getPostBySlug.mockResolvedValue(aPost({ coverImage: null }));
    expect(render(await Article(params("x")))).not.toContain("<img");
  });

  it("omits the byline separator when the date is missing", async () => {
    getPostBySlug.mockResolvedValue(aPost({ date: "" }));

    const html = render(await Article(params("x")));

    expect(html).not.toContain("<time");
    expect(text(html)).not.toContain("·");
  });

  it("404s on an unknown slug rather than rendering an empty article", async () => {
    getPostBySlug.mockResolvedValue(null);

    await expect(Article(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("links inside the article body", () => {
  // A one-paragraph body holding a single hyperlink to `uri`.
  const bodyWithLink = (uri: string) => ({
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "hyperlink",
            data: { uri },
            content: [
              {
                nodeType: "text",
                value: "the spec sheet",
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
    ],
  });

  const renderWithLink = async (uri: string) => {
    getPostBySlug.mockResolvedValue(
      aPost({ body: bodyWithLink(uri) as never }),
    );
    return render(await Article(params("pixel-10-pro-review")));
  };

  it("renders an external link that cannot reach back into this page", async () => {
    const html = await renderWithLink("https://store.example.com/pixel");

    expect(html).toContain('href="https://store.example.com/pixel"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders a site-relative link without rel", async () => {
    const html = await renderWithLink("/blog/mwc-2026-preview");

    expect(html).toContain('href="/blog/mwc-2026-preview"');
    expect(html).not.toContain("noopener");
  });

  it("drops a javascript: link but keeps its text", async () => {
    const html = await renderWithLink("javascript:alert(document.cookie)");

    expect(html).not.toContain("javascript:");
    // the text stays, but nothing wraps it in a link
    expect(html).not.toMatch(/<a [^>]*>the spec sheet/);
    expect(text(html)).toContain("the spec sheet");
  });
});
