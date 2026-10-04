"use client";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

/** Switches between light and dark and saves the choice in localStorage. */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next: Theme =
      root.getAttribute("data-theme") === "light" ? "dark" : "light";

    root.setAttribute("data-theme", next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked. The theme still changes for this page view.
    }
  }

  return (
    <button type="button" onClick={toggle} className="p-2 text-ink-muted">
      {/* CSS hides the label that does not match the current theme. */}
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
