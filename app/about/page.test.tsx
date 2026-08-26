import { beforeEach, describe, expect, it, vi } from "vitest";

import { aMember, aPageContent, aSiteSettings } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPageContent = vi.fn();
const getSiteSettings = vi.fn();
const getTeam = vi.fn();

vi.mock("@/lib/cms/queries", () => ({
  getPageContent,
  getSiteSettings,
  getTeam,
}));

const { default: About } = await import("./page");

beforeEach(() => {
  getPageContent.mockResolvedValue(aPageContent({ heading: "About Circuit" }));
  getSiteSettings.mockResolvedValue(aSiteSettings());
  getTeam.mockResolvedValue([aMember()]);
});

describe("About page", () => {
  it("renders the mission and vision statements from site settings", async () => {
    const body = text(render(await About()));

    expect(body).toContain("Our mission");
    expect(body).toContain("Mission body.");
    expect(body).toContain("Our vision");
    expect(body).toContain("Vision body.");
  });

  it("drops a statement whose title or body is missing", async () => {
    getSiteSettings.mockResolvedValue(aSiteSettings({ visionBody: "" }));

    const body = text(render(await About()));

    expect(body).toContain("Our mission");
    expect(body).not.toContain("Our vision");
  });

  it("skips the statements section when settings are unavailable", async () => {
    getSiteSettings.mockResolvedValue(null);

    const body = text(render(await About()));

    expect(body).not.toContain("Our mission");
    expect(body).toContain("Section one");
  });

  it("renders each writer with a photo and a link to their profile", async () => {
    const html = render(await About());

    expect(text(html)).toContain("Ananya Prasad");
    expect(text(html)).toContain("Senior Reviews Editor");
    expect(text(html)).toContain("Covers Android flagships.");
    expect(html).toContain('href="/team/ananya-prasad"');
    expect(html).toContain("ananya.jpg");
  });

  it("falls back to initials when a writer has no photo", async () => {
    getTeam.mockResolvedValue([aMember({ photo: null, name: "Marcus Feld" })]);

    const html = render(await About());

    expect(html).not.toContain("<img");
    expect(text(html)).toContain("MF");
  });

  it("explains the empty state rather than rendering an empty list", async () => {
    getTeam.mockResolvedValue([]);

    expect(text(render(await About()))).toContain(
      "Writer details are being updated",
    );
  });
});
