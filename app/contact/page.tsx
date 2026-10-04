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
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="mt-4 text-sm text-ink-muted">
            This page is temporarily unavailable. Please try again shortly.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-2xl px-6 py-10">
        <p className="text-sm text-ink-muted">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold">{copy.heading}</h1>
        {copy.intro && (
          <p className="mt-5 text-lg leading-8 text-ink-muted">{copy.intro}</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-2xl px-6 pb-8">
        <div className="box">
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
