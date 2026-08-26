"use client";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

/**
 * Switches between the two palettes and remembers the choice.
 *
 * Holds no React state. Which icon and which accessible label apply is decided
 * in CSS from the `data-theme` attribute, so the correct pair is painted in the
 * first frame. Deriving them from state would mean either a hydration mismatch
 * or a visible flip once hydration completes.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next: Theme =
      root.getAttribute("data-theme") === "light" ? "dark" : "light";

    root.setAttribute("data-theme", next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing or blocked site data. The theme still applies to this
      // page view; it just will not be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
    >
      {/* Only the one matching the active theme is rendered, so exactly one
          label reaches assistive technology. */}
      <span className="theme-icon-dark sr-only">Switch to light theme</span>
      <span className="theme-icon-light sr-only">Switch to dark theme</span>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="theme-icon-dark h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="theme-icon-light h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
