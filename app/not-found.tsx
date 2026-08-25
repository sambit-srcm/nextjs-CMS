import Link from "next/link";

/** Shown for unmatched routes, replacing the unstyled Next.js default. */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
          404
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Page not found
        </h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Back to home
        </Link>
      </section>
    </div>
  );
}
