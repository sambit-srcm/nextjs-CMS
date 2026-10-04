/** Reads Contentful fields. A missing required field is skipped, not rendered. */

/** Reads a required string, reporting the entry when it is missing. */
export function requiredString(
  value: unknown,
  field: string,
  entryId: string,
): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;

  console.warn(
    `Contentful entry ${entryId} is missing required field "${field}"; skipping entry.`,
  );
  return null;
}

/** Reads an optional string, falling back to an empty string. */
export function optionalString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
