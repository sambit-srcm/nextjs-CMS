import { getContactPage } from "@/lib/cms/queries";

import { ContactForm } from "./contact-form";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

export default async function Contact() {
  const copy = await getContactPage();

  if (!copy) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            Contact us
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            This page is temporarily unavailable. Please try again shortly.
          </p>
        </section>
      </div>
    );
  }

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
