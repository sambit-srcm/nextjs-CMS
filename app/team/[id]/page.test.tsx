import { beforeEach, describe, expect, it, vi } from "vitest";

import { aMember, aPost } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPosts = vi.fn();
const getTeam = vi.fn();
const getTeamMember = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPosts, getTeam, getTeamMember }));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { default: Writer, generateMetadata, generateStaticParams } =
  await import("./page");

// Matches the route props Next passes in: both are promises, and
// `searchParams` is present even though these routes ignore it.
const params = (id: string) => ({
  params: Promise.resolve({ id }),
  searchParams: Promise.resolve({}),
});

beforeEach(() => {
  getTeamMember.mockResolvedValue(aMember());
  getTeam.mockResolvedValue([aMember()]);
  getPosts.mockResolvedValue([aPost()]);
});

describe("generateStaticParams", () => {
  it("returns an id for every writer", async () => {
    getTeam.mockResolvedValue([
      aMember({ id: "ananya-prasad" }),
      aMember({ id: "marcus-feld" }),
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { id: "ananya-prasad" },
      { id: "marcus-feld" },
    ]);
  });
});

describe("generateMetadata", () => {
  it("describes the writer and their social card", async () => {
    const meta = await generateMetadata(params("ananya-prasad"));

    expect(meta.title).toBe("Ananya Prasad — Circuit");
    expect(meta.description).toContain("Senior Reviews Editor at Circuit.");
    expect(meta.openGraph).toMatchObject({
      type: "profile",
      images: [{ url: "https://images.test/ananya.jpg" }],
    });
  });

  it("caps the description at 200 characters", async () => {
    getTeamMember.mockResolvedValue(aMember({ bio: "x".repeat(400) }));

    const meta = await generateMetadata(params("ananya-prasad"));

    expect(meta.description).toHaveLength(200);
  });

  it("leaves the image off when the writer has no photo", async () => {
    getTeamMember.mockResolvedValue(aMember({ photo: null }));

    const meta = await generateMetadata(params("ananya-prasad"));

    expect(meta.openGraph).toMatchObject({ images: undefined });
  });

  it("falls back to a not-found title for an unknown id", async () => {
    getTeamMember.mockResolvedValue(null);

    await expect(generateMetadata(params("nope"))).resolves.toEqual({
      title: "Writer not found",
    });
  });
});

describe("Writer page", () => {
  it("renders the profile with photo, designation and bio", async () => {
    const html = render(await Writer(params("ananya-prasad")));

    expect(text(html)).toContain("Ananya Prasad");
    expect(text(html)).toContain("Senior Reviews Editor");
    expect(text(html)).toContain("Covers Android flagships.");
    expect(html).toContain("ananya.jpg");
  });

  it("falls back to initials when the writer has no photo", async () => {
    getTeamMember.mockResolvedValue(
      aMember({ photo: null, name: "Marcus Feld" }),
    );

    const html = render(await Writer(params("marcus-feld")));

    expect(html).not.toContain("<img");
    expect(text(html)).toContain("MF");
  });

  it("omits the bio paragraph when the field is empty", async () => {
    getTeamMember.mockResolvedValue(aMember({ bio: "" }));

    expect(text(render(await Writer(params("ananya-prasad"))))).not.toContain(
      "Covers Android flagships.",
    );
  });

  it("lists only the articles this writer wrote", async () => {
    getPosts.mockResolvedValue([
      aPost({ title: "Theirs", slug: "theirs", author: "Ananya Prasad" }),
      aPost({ title: "Someone else's", slug: "other", author: "Marcus Feld" }),
    ]);

    const html = render(await Writer(params("ananya-prasad")));

    expect(text(html)).toContain("Articles by Ananya");
    expect(text(html)).toContain("Theirs");
    expect(text(html)).not.toContain("Someone else's");
    expect(html).toContain('href="/blog/theirs"');
  });

  it("says so plainly when the writer has published nothing", async () => {
    getPosts.mockResolvedValue([aPost({ author: "Marcus Feld" })]);

    const body = text(render(await Writer(params("ananya-prasad"))));

    expect(body).toContain("No published articles yet.");
    expect(body).not.toContain("Articles by");
  });

  it("404s on an unknown id rather than rendering an empty profile", async () => {
    getTeamMember.mockResolvedValue(null);

    await expect(Writer(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
