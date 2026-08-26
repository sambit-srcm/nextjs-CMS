/**
 * Suspense fallback shown while a route's content is being fetched.
 *
 * Mirrors the shared page skeleton — masthead, then a stack of entries — so the
 * layout does not shift when the real content arrives.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col"
      role="status"
      aria-label="Loading content"
    >
      <section className="mx-auto w-full max-w-4xl px-6 pt-20 pb-6 sm:pt-28">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-raised" />
        <div className="mt-5 h-12 w-80 max-w-full animate-pulse rounded-lg bg-surface-raised" />
        <div className="mt-5 h-5 w-full max-w-md animate-pulse rounded bg-surface-raised" />
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-8">
        <div className="divide-y divide-line border-t border-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="py-9">
              <div className="h-3 w-32 animate-pulse rounded bg-surface-raised" />
              <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-surface-raised" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-surface-raised" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-surface-raised" />
            </div>
          ))}
        </div>
      </section>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
