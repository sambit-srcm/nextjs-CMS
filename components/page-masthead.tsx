import type { PageContent } from "@/lib/cms/types";

/** Heading block shared by About, Services, and Blog. Empty CMS fields are skipped. */
export function PageMasthead({
  copy,
  maxWidth = "max-w-4xl",
}: {
  copy: PageContent | null;
  /** Tailwind max-width, so a page can match the grid below it. */
  maxWidth?: string;
}) {
  return (
    <section className={`mx-auto w-full ${maxWidth} px-6 py-10`}>
      {copy?.eyebrow && (
        <p className="text-sm text-ink-muted">{copy.eyebrow}</p>
      )}
      <h1 className="mt-2 text-3xl font-semibold">{copy?.heading}</h1>
      {copy?.intro && (
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
          {copy.intro}
        </p>
      )}
    </section>
  );
}
