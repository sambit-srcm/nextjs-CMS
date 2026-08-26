"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * Must be a Client Component: React needs to attach it as a boundary on the
 * client, and `reset` re-renders the segment without a full page reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest correlates this render with the server-side stack trace,
    // which is not sent to the browser.
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm leading-6 text-ink-muted">
          This page could not be loaded. It is usually temporary — trying again
          often resolves it.
        </p>
        <button
          onClick={reset}
          className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
