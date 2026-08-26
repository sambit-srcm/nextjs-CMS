import { describe, expect, it } from "vitest";

import { aPageContent } from "@/test/fixtures";
import { render, text } from "@/test/render";

import { PageMasthead } from "./page-masthead";

describe("PageMasthead", () => {
  it("renders the eyebrow, heading and intro from the CMS", () => {
    const body = text(render(<PageMasthead copy={aPageContent()} />));

    expect(body).toContain("Eyebrow copy");
    expect(body).toContain("Heading copy");
    expect(body).toContain("Intro copy");
  });

  it("omits the eyebrow and intro when an editor has not filled them in", () => {
    const html = render(
      <PageMasthead copy={aPageContent({ eyebrow: "", intro: "" })} />,
    );

    expect(text(html)).not.toContain("Eyebrow copy");
    expect(text(html)).not.toContain("Intro copy");
    // The heading still renders, so the page keeps its document outline.
    expect(html).toContain("<h1");
  });

  it("still renders the heading element when there is no copy at all", () => {
    expect(render(<PageMasthead copy={null} />)).toContain("<h1");
  });

  it("defaults to the narrow width and accepts a wider one", () => {
    expect(render(<PageMasthead copy={null} />)).toContain("max-w-4xl");
    expect(render(<PageMasthead copy={null} maxWidth="max-w-5xl" />)).toContain(
      "max-w-5xl",
    );
  });
});
