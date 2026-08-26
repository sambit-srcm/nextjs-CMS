import { describe, expect, it, vi } from "vitest";

import { render, text } from "@/test/render";

import RouteError from "./error";
import Loading from "./loading";
import NotFound from "./not-found";

describe("Loading", () => {
  it("announces itself and mirrors the page skeleton", () => {
    const html = render(<Loading />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading content"');
    expect(text(html)).toContain("Loading");
    // Three placeholder entries, matching the real listings.
    expect(html.match(/animate-pulse/g)?.length).toBeGreaterThan(3);
  });
});

describe("NotFound", () => {
  it("explains the 404 and offers a way back", () => {
    const html = render(<NotFound />);

    expect(text(html)).toContain("404");
    expect(text(html)).toContain("Page not found");
    expect(html).toContain('href="/"');
  });
});

describe("RouteError", () => {
  it("offers a retry without exposing the underlying fault", () => {
    const reset = vi.fn();
    const fault = Object.assign(new Error("Contentful 500"), { digest: "abc" });
    const html = render(<RouteError error={fault} reset={reset} />);

    expect(text(html)).toContain("Something went wrong");
    expect(text(html)).toContain("Try again");
    // The message would leak infrastructure detail to the visitor.
    expect(html).not.toContain("Contentful 500");
  });
});
