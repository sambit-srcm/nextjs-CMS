/**
 * Raised when a Contentful request fails outright — network error, bad
 * credentials, unknown content type. Carries the originating error as `cause`
 * so the underlying failure is not lost.
 */
class CmsError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CmsError";
  }
}

/**
 * Runs a Contentful query and degrades to `fallback` if it fails.
 *
 * A CMS outage should not take the whole site down with it, so failures are
 * logged server-side and the caller receives an empty result instead. The
 * page then renders its empty state rather than a 500.
 */
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
