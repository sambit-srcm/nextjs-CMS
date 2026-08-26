import { beforeEach, describe, expect, it, vi } from "vitest";

import { aPageContent, aService } from "@/test/fixtures";
import { render, text } from "@/test/render";

const getPageContent = vi.fn();
const getServices = vi.fn();

vi.mock("@/lib/cms/queries", () => ({ getPageContent, getServices }));

const { default: Topics } = await import("./page");

beforeEach(() => {
  getPageContent.mockResolvedValue(aPageContent({ heading: "What we offer" }));
  getServices.mockResolvedValue([aService()]);
});

describe("Services page", () => {
  it("renders the masthead copy from the CMS", async () => {
    const html = render(await Topics());

    expect(text(html)).toContain("Eyebrow copy");
    expect(text(html)).toContain("What we offer");
    expect(text(html)).toContain("Intro copy");
  });

  it("renders each service with its description, price and image", async () => {
    getServices.mockResolvedValue([
      aService({ title: "Buying Guides", price: "From $1,200" }),
    ]);

    const html = render(await Topics());

    expect(text(html)).toContain("Buying Guides");
    expect(text(html)).toContain("Long-form unboxings.");
    expect(text(html)).toContain("From $1,200");
    expect(html).toContain("reviews.jpg");
  });

  it("substitutes a gradient when a service has no image", async () => {
    getServices.mockResolvedValue([aService({ image: null })]);

    const html = render(await Topics());

    expect(html).not.toContain("<img");
    expect(html).toContain("bg-gradient-to-br");
  });

  it("omits the price when the field is empty", async () => {
    getServices.mockResolvedValue([aService({ price: "" })]);

    expect(text(render(await Topics()))).not.toContain("From");
  });

  it("omits the eyebrow and intro when no page copy exists", async () => {
    getPageContent.mockResolvedValue(null);

    const body = text(render(await Topics()));

    expect(body).not.toContain("Eyebrow copy");
    expect(body).not.toContain("Intro copy");
  });

  it("explains the empty state rather than rendering a bare grid", async () => {
    getServices.mockResolvedValue([]);

    expect(text(render(await Topics()))).toContain(
      "Services are being updated",
    );
  });
});
