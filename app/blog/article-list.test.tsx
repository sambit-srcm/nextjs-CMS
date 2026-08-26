import { describe, expect, it, vi } from "vitest";

import { aPost } from "@/test/fixtures";
import { render, text } from "@/test/render";

vi.mock("next/navigation", () => ({ usePathname: () => "/blog" }));

import { ArticleList } from "./article-list";

/*
 * The prerendered frame is what a visitor sees before hydration and what a
 * crawler indexes, so it must already carry every article. Filtering itself is
 * covered against `filterPosts` directly, without a DOM.
 */

describe("ArticleList", () => {
  it("prerenders every article with its byline and link", () => {
    const html = render(
      <ArticleList
        posts={[
          aPost({ title: "Pixel 10 Pro review", slug: "pixel" }),
          aPost({ title: "iPhone 18 review", slug: "iphone" }),
        ]}
      />,
    );

    expect(text(html)).toContain("Pixel 10 Pro review");
    expect(text(html)).toContain("iPhone 18 review");
    expect(text(html)).toContain("Ananya Prasad");
    expect(text(html)).toContain("14 February 2026");
    expect(html).toContain('href="/blog/pixel"');
  });

  it("paints the full list from the server without fetching", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const html = render(
      <ArticleList posts={[aPost(), aPost({ slug: "b" })]} />,
    );

    // fallbackData seeds SWR with the prerendered list, so the first paint
    // carries every article and issues no request for data the page already
    // holds. Losing this would mean shipping an empty list that fills in.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(text(html)).toContain("Pixel 10 Pro review");

    vi.unstubAllGlobals();
  });

  it("offers a labelled search box and an unfiltered count", () => {
    const html = render(
      <ArticleList posts={[aPost(), aPost({ slug: "b" })]} />,
    );

    expect(html).toContain('id="article-search"');
    expect(text(html)).toContain("Search articles");
    expect(text(html)).toContain("2 articles");
    // Polite, so the count does not interrupt on every keystroke.
    expect(html).toContain('aria-live="polite"');
  });

  it("counts a single article in the singular", () => {
    expect(text(render(<ArticleList posts={[aPost()]} />))).toContain(
      "1 article",
    );
  });

  it("omits the byline separator when the date is missing", () => {
    const html = render(<ArticleList posts={[aPost({ date: "" })]} />);

    expect(text(html)).toContain("Ananya Prasad");
    expect(text(html)).not.toContain("·");
  });

  it("shows the no-match notice when there is nothing to list", () => {
    const html = render(<ArticleList posts={[]} />);

    expect(text(html)).toContain("Nothing matches");
    expect(html).not.toContain("<ul");
  });
});
