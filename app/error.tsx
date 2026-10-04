"use client";

import { useEffect } from "react";

/** Shown when a page throws. `reset` tries rendering it again. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest links this error to the server log entry.
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm leading-6 text-ink-muted">
          This page could not be loaded. It is usually temporary — trying again
          often resolves it.
        </p>
        <button onClick={reset} className="button mt-3">
          Try again
        </button>
      </section>
    </div>
  );
}
