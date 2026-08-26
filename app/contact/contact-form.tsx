"use client";

import { useState } from "react";

import type { ContactPageCopy } from "@/lib/cms/types";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = Pick<
  ContactPageCopy,
  "submitLabel" | "submittingLabel" | "successMessage" | "errorMessage"
>;

export function ContactForm({
  submitLabel,
  submittingLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) throw new Error(`Contact request failed: ${res.status}`);

      setStatus("success");
      form.reset();
    } catch (error) {
      // The visitor sees the CMS-authored error message; the reason goes to
      // the console so a failure is diagnosable rather than silent. Swallowing
      // it entirely left a broken form looking identical to a rejected one.
      console.error("Contact form submission failed:", error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-muted focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-muted focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-muted focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong disabled:opacity-50"
      >
        {status === "submitting" ? submittingLabel : submitLabel}
      </button>

      {status === "success" && (
        <p className="text-sm text-accent-strong">{successMessage}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
