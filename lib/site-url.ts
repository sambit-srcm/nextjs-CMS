/**
 * The origin this site is served from, used to build absolute URLs for
 * canonical links, robots.txt and the sitemap.
 *
 * Deliberately does not throw on a missing value, unlike the Contentful
 * credentials in `lib/cms/env.ts`. A wrong canonical host is a search-ranking
 * problem, not a broken page, so a missing variable falls back rather than
 * failing the build. Set NEXT_PUBLIC_SITE_URL in production to be sure.
 */
function resolve(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  // Vercel exposes the stable production host; preview deployments get their
  // own URL, which is correct for a preview's canonical links.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/** Origin with any trailing slash removed, so `${siteUrl}/path` is well formed. */
export const siteUrl = resolve().replace(/\/+$/, "");

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}
