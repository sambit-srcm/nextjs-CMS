"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { isActive, NAV_LINKS } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

/**
 * Primary navigation.
 *
 * A Client Component because the active link is derived from the current
 * pathname and the mobile menu holds open/closed state.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-baseline gap-2.5"
        >
          <span className="text-lg font-semibold tracking-tight text-ink">
            Remo
          </span>
          <span className="hidden text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase sm:inline">
            Cycling Journal
          </span>
        </Link>

        <div className="flex items-center gap-1">
        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-accent-soft font-medium text-accent-strong"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink sm:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-line sm:hidden"
        >
          <ul className="mx-auto flex w-full max-w-6xl flex-col px-6 py-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block py-3 text-sm ${
                      active
                        ? "font-medium text-accent-strong"
                        : "text-ink-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
