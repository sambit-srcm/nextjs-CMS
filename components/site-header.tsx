"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { CmsImage } from "@/lib/cms/types";

import { isActive, NAV_LINKS } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

/** Site navigation. A client component because it tracks the open menu. */
export function SiteHeader({
  siteName,
  siteTagline,
  logo,
}: {
  siteName: string;
  siteTagline: string;
  /** Brand mark from the CMS. The wordmark alone is used when absent. */
  logo?: CmsImage | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5"
        >
          {logo && (
            <Image
              src={logo.url}
              alt=""
              width={28}
              height={28}
              // Rounded to match the logo's own background.
              className="rounded-md"
              // Load immediately. This logo is on every page.
              loading="eager"
            />
          )}
          {/* Logo is centred against the name and tagline, not aligned to their baseline. */}
          <span className="flex items-baseline gap-2.5">
            <span className="text-lg font-semibold">{siteName}</span>
            <span className="hidden text-sm text-ink-muted sm:inline">
              {siteTagline}
            </span>
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
                      className={`px-3 py-2 text-sm ${
                        active ? "font-medium underline" : "text-ink-muted"
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
            className="p-2 sm:hidden"
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
