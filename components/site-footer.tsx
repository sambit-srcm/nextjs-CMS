import Link from "next/link";

import { NAV_LINKS } from "./site-nav";

/** Server Component: no client state needed. */
export function SiteFooter({
  siteName,
  footerTagline,
}: {
  siteName: string;
  footerTagline: string;
}) {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="text-lg font-semibold">{siteName}</p>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            {footerTagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-sm font-medium">Sections</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-muted">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
