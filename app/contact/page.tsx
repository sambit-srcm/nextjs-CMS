import { getContactPage } from "@/lib/contentful/queries";
import type { ContactPageCopy } from "@/lib/contentful/types";

import { ContactForm } from "./contact-form";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

/**
 * The form has to stay usable even if the CMS is unreachable, so its wording
 * falls back to these rather than rendering empty labels.
 */
const FALLBACK_COPY: ContactPageCopy = {
  heading: "Contact us",
  intro: "",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successMessage: "Thanks — we'll get back to you soon.",
  errorMessage: "Something went wrong. Please try again.",
};

/**
 * Merges CMS copy over the fallbacks, ignoring blanks. An optional field that
 * is absent on the entry comes back as an empty string, which would otherwise
 * override a good default and render an unlabelled button.
 */
function withFallbacks(fetched: ContactPageCopy | null): ContactPageCopy {
  if (!fetched) return FALLBACK_COPY;

  const populated = Object.fromEntries(
    Object.entries(fetched).filter(([, value]) => value !== ""),
  );

  return { ...FALLBACK_COPY, ...populated };
}

export default async function Contact() {
  const copy = withFallbacks(await getContactPage());

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          {copy.heading}
        </h1>
        {copy.intro && (
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {copy.intro}
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-md px-6 py-16">
        <ContactForm
          submitLabel={copy.submitLabel}
          submittingLabel={copy.submittingLabel}
          successMessage={copy.successMessage}
          errorMessage={copy.errorMessage}
        />
      </section>
    </div>
  );
}
