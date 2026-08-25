/**
 * Suspense fallback shown while a route's content is being fetched.
 *
 * Mirrors the shared page skeleton — centred hero, then a card grid — so the
 * layout does not shift when the real content arrives.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col bg-zinc-50 dark:bg-black"
      role="status"
      aria-label="Loading content"
    >
      <section className="flex flex-col items-center gap-4 px-6 py-24">
        <div className="h-12 w-64 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-6 w-96 max-w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </section>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
