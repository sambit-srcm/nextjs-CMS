/** One date format across the site, so listings and articles cannot disagree. */
export function formatDate(value: string): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Marcus Feld" becomes "MF". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}
