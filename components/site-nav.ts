/** Single source of truth for the primary navigation, shared by header and footer. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * The home link would match every path under a prefix test, so it is compared
 * exactly while the rest match their section and any future child routes.
 */
export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
