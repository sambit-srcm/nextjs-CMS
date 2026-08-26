import type { PageContent } from "@/lib/cms/types";

/**
 * The eyebrow / heading / intro block at the top of a section page.
 *
 * About, Services and Blog each carried their own copy of this markup, which
 * meant a typography change had to be made three times to stay consistent.
 *
 * Every field is optional because the copy comes from the CMS: an entry an
 * editor has not filled in renders fewer elements rather than empty ones.
 */
export function PageMasthead({
  copy,
  maxWidth = "max-w-4xl",
}: {
  copy: PageContent | null;
  /** Tailwind max-width, so a page can match the grid below it. */
  maxWidth?: string;
}) {
  return (
    <section className={`mx-auto w-full ${maxWidth} px-6 pt-20 pb-6 sm:pt-28`}>
      {copy?.eyebrow && (
        <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
          {copy.eyebrow}
        </p>
      )}
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {copy?.heading}
      </h1>
      {copy?.intro && (
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
          {copy.intro}
        </p>
      )}
    </section>
  );
}
