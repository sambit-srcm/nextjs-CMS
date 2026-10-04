import Link from "next/link";

/** Shown for unmatched routes, replacing the unstyled Next.js default. */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="max-w-md text-sm leading-6 text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="button mt-3">
          Back to home
        </Link>
      </section>
    </div>
  );
}
