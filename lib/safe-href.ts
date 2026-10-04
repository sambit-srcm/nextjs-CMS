/** Protocols allowed in article links; others (e.g. `javascript:`) are dropped. */
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/** Returns the link if it is safe to use as an href, otherwise null. */
export function safeHref(uri: unknown): string | null {
  if (typeof uri !== "string") return null;

  const link = uri.trim();
  if (link === "") return null;

  // An #anchor on the same page.
  if (link.startsWith("#")) return link;

  // A path on this site, like /blog. (`//host` is another site, checked below.)
  if (link.startsWith("/") && !link.startsWith("//")) return link;

  // Anything else must be a full URL with an allowed protocol.
  try {
    const protocol = new URL(link).protocol;
    if (SAFE_PROTOCOLS.includes(protocol)) return link;
    return null;
  } catch {
    return null; // not a valid URL
  }
}

/** True for absolute http(s) links, which point away from this site. */
export function isExternalHref(href: string): boolean {
  const lower = href.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://");
}
