import type { Metadata } from "next";
import { getContactPage } from "@/lib/cms/queries";

import { ContactForm } from "./contact-form";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
};

export default async function Contact() {
  const copy = await getContactPage();

  if (!copy) {
    return (
      <div className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-28 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Contact
          </h1>
          <p className="mt-4 text-sm text-ink-muted">
            This page is temporarily unavailable. Please try again shortly.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-2xl px-6 pt-20 pb-6 sm:pt-28">
        <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
          Contact
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {copy.heading}
        </h1>
        {copy.intro && (
          <p className="mt-5 text-lg leading-8 text-ink-muted">{copy.intro}</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-2xl px-6 pb-8">
        <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9">
          <ContactForm
            submitLabel={copy.submitLabel}
            submittingLabel={copy.submittingLabel}
            successMessage={copy.successMessage}
            errorMessage={copy.errorMessage}
          />
        </div>
      </section>
    </div>
  );
}
