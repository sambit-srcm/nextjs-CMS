/** A failed Contentful request; the original error is kept as `cause`. */
export class CmsError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CmsError";
  }
}

/** Runs a Contentful query. On failure, logs it and returns `fallback`. */
export async function withFallback<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (cause) {
    const error = new CmsError(`Contentful query "${label}" failed`, {
      cause,
    });
    console.error(error.message, cause);
    return fallback;
  }
}
