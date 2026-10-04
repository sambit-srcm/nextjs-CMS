import { afterEach, describe, expect, it, vi } from "vitest";

import { render, text } from "@/test/render";

import { ThemeToggle } from "@/components/theme-toggle";

/** Calls the button's onClick without a browser. */
function clickHandler() {
  const element = ThemeToggle() as { props: { onClick: () => void } };
  return element.props.onClick;
}

function stubDocument(current: string | null) {
  const attributes = new Map<string, string>();
  if (current) attributes.set("data-theme", current);

  vi.stubGlobal("document", {
    documentElement: {
      getAttribute: (name: string) => attributes.get(name) ?? null,
      setAttribute: (name: string, value: string) =>
        attributes.set(name, value),
    },
  });

  return attributes;
}

afterEach(() => vi.unstubAllGlobals());

describe("ThemeToggle", () => {
  it("renders one label per theme, so exactly one reaches assistive tech", () => {
    const html = render(<ThemeToggle />);

    expect(text(html)).toContain("Switch to light theme");
    expect(text(html)).toContain("Switch to dark theme");
    // Which of the pair is visible is decided in CSS from `data-theme`.
    expect(html).toContain("theme-icon-dark");
    expect(html).toContain("theme-icon-light");
  });

  it("switches dark to light and stores the choice", () => {
    const attributes = stubDocument("dark");
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });

    clickHandler()();

    expect(attributes.get("data-theme")).toBe("light");
    expect(setItem).toHaveBeenCalledWith("theme", "light");
  });

  it("switches light back to dark", () => {
    const attributes = stubDocument("light");
    vi.stubGlobal("localStorage", { setItem: vi.fn() });

    clickHandler()();

    expect(attributes.get("data-theme")).toBe("dark");
  });

  it("treats a missing theme as dark and switches to light", () => {
    const attributes = stubDocument(null);
    vi.stubGlobal("localStorage", { setItem: vi.fn() });

    clickHandler()();

    expect(attributes.get("data-theme")).toBe("light");
  });

  it("still applies the theme when site data is blocked", () => {
    const attributes = stubDocument("dark");
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("SecurityError");
      },
    });

    expect(() => clickHandler()()).not.toThrow();
    expect(attributes.get("data-theme")).toBe("light");
  });
});
