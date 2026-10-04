/** Public site URL. Falls back to the Vercel host, then localhost. */
function resolve(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  // Vercel's production hostname, when this is deployed there.
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
