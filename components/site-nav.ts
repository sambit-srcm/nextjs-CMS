/** Single source of truth for the primary navigation, shared by header and footer. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Reviews" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Home matches exactly; other links also match their child routes. */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
