import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPageContent, aPost, aService, aSiteSettings } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPageContent = vi.fn();
const getSiteSettings = vi.fn();
const getServices = vi.fn();
const getPosts = vi.fn();

vi.mock("@/lib/cms/queries", () => ({
  getPageContent,
  getSiteSettings,
  getServices,
  getPosts,
}));

const { default: Home } = await import("./page");

const threePosts = [
  aPost({ title: "Lead story", slug: "lead" }),
  aPost({ title: "Second story", slug: "second" }),
  aPost({ title: "Third story", slug: "third" }),
];

beforeEach(() => {
  getPageContent.mockResolvedValue(aPageContent());
  getSiteSettings.mockResolvedValue(aSiteSettings());
  getServices.mockResolvedValue([aService()]);
  getPosts.mockResolvedValue(threePosts);
});

describe("Home page", () => {
  it("renders the banner and both calls to action from the CMS", async () => {
    const html = render(await Home());

    expect(text(html)).toContain("Banner title");
    expect(text(html)).toContain("Banner subtitle");
    expect(html).toContain('href="/blog"');
    expect(text(html)).toContain("Read reviews");
    expect(text(html)).toContain("About us");
  });

  it("drops the banner when site settings are unavailable", async () => {
    getSiteSettings.mockResolvedValue(null);

    expect(text(render(await Home()))).not.toContain("Banner title");
  });

  it("promotes the newest article and lists the rest separately", async () => {
    const html = render(await Home());

    expect(text(html)).toContain("Latest");
    expect(text(html)).toContain("Lead story");
    expect(html).toContain('href="/blog/lead"');
    expect(text(html)).toContain("Second story");
    expect(text(html)).toContain("Third story");
  });

  it("asks for only three articles and three services", async () => {
    await Home();

    expect(getPosts).toHaveBeenCalledWith(3);
    expect(getServices).toHaveBeenCalledWith(3);
  });

  it("skips the secondary grid when the lead is the only article", async () => {
    getPosts.mockResolvedValue([aPost({ title: "Only story" })]);

    const body = text(render(await Home()));

    expect(body).toContain("Only story");
    expect(body).not.toContain("All articles");
  });

  it("renders no article sections at all when there are no posts", async () => {
    getPosts.mockResolvedValue([]);

    const body = text(render(await Home()));

    expect(body).not.toContain("Latest");
    expect(body).not.toContain("All articles");
  });

  it("teases the services with a link through to the full list", async () => {
    const html = render(await Home());

    expect(text(html)).toContain("Section two");
    expect(text(html)).toContain("Sponsored Reviews");
    expect(html).toContain('href="/services"');
  });

  it("skips the services section when the CMS returns none", async () => {
    getServices.mockResolvedValue([]);

    expect(text(render(await Home()))).not.toContain("All services");
  });

  it("separates author and date only when both are present", async () => {
    getPosts.mockResolvedValue([aPost({ author: "Priya Raman", date: "" })]);

    const lead = text(render(await Home()));

    expect(lead).toContain("Priya Raman");
    expect(lead).not.toContain("·");
  });
});
