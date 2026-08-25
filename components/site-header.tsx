"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { isActive, NAV_LINKS } from "./site-nav";

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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          onClick={() => setOpen(false)}
        >
          Remo
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "text-sm font-medium text-zinc-950 dark:text-zinc-50"
                        : "text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-md p-2 text-zinc-600 transition-colors hover:text-zinc-950 sm:hidden dark:text-zinc-400 dark:hover:text-zinc-50"
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

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-zinc-200 sm:hidden dark:border-zinc-800"
        >
          <ul className="mx-auto flex w-full max-w-5xl flex-col px-6 py-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "block py-3 text-sm font-medium text-zinc-950 dark:text-zinc-50"
                        : "block py-3 text-sm text-zinc-600 dark:text-zinc-400"
                    }
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
