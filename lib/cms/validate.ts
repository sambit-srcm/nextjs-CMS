/**
 * Field-level coercion for Contentful responses.
 *
 * The delivery API is typed optimistically: a field that is required in the
 * content model can still be absent on an entry that was published before the
 * field existed. These helpers make that explicit at the mapping boundary so
 * components never receive `undefined` where they expect a string.
 */

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
