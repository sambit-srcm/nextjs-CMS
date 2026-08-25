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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          This page could not be loaded. It is usually temporary — trying again
          often resolves it.
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
