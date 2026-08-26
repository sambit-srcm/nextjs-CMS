import Link from "next/link";

/** Shown for unmatched routes, replacing the unstyled Next.js default. */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Page not found
        </h1>
        <p className="max-w-md text-sm leading-6 text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Back to home
        </Link>
      </section>
    </div>
  );
}
