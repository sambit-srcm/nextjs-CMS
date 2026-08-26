import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPageContent, aPost } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPageContent = vi.fn();
const getPosts = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPageContent, getPosts }));

const { default: Blog } = await import("./page");

beforeEach(() => {
  getPageContent.mockResolvedValue(aPageContent({ heading: "Reviews" }));
  getPosts.mockResolvedValue([aPost()]);
});

describe("Blog page", () => {
  it("renders the masthead copy from the CMS", async () => {
    const body = text(render(await Blog()));

    expect(body).toContain("Eyebrow copy");
    expect(body).toContain("Reviews");
    expect(body).toContain("Intro copy");
  });

  it("prerenders every article into the markup for the client filter", async () => {
    getPosts.mockResolvedValue([
      aPost({ title: "Pixel 10 Pro review", slug: "pixel" }),
      aPost({ title: "iPhone 18 review", slug: "iphone" }),
    ]);

    const html = render(await Blog());

    expect(text(html)).toContain("Pixel 10 Pro review");
    expect(text(html)).toContain("iPhone 18 review");
    expect(html).toContain('href="/blog/pixel"');
  });

  it("omits the eyebrow and intro when no page copy exists", async () => {
    getPageContent.mockResolvedValue(null);

    const body = text(render(await Blog()));

    expect(body).not.toContain("Eyebrow copy");
    expect(body).not.toContain("Intro copy");
  });

  it("explains the empty state instead of rendering the search box", async () => {
    getPosts.mockResolvedValue([]);

    const html = render(await Blog());

    expect(text(html)).toContain("No articles have been published yet");
    expect(html).not.toContain("article-search");
  });
});
