import { beforeEach, describe, expect, it, vi } from "vitest";

import { aContactPage } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getContactPage = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getContactPage }));

const { default: Contact } = await import("./page");

beforeEach(() => {
  getContactPage.mockResolvedValue(aContactPage());
});

describe("Contact page", () => {
  it("renders the CMS copy and the form", async () => {
    const html = render(await Contact());

    expect(text(html)).toContain("Get in touch");
    expect(text(html)).toContain("Pitch a device or ask about partnerships.");
    expect(text(html)).toContain("Send message");
    expect(html).toContain('name="email"');
  });

  it("omits the intro paragraph when the field is empty", async () => {
    getContactPage.mockResolvedValue(aContactPage({ intro: "" }));

    expect(text(render(await Contact()))).not.toContain("Pitch a device");
  });

  it("degrades to an explanatory notice when the CMS copy is missing", async () => {
    getContactPage.mockResolvedValue(null);

    const html = render(await Contact());

    expect(text(html)).toContain("This page is temporarily unavailable");
    expect(html).not.toContain("<form");
  });
});
