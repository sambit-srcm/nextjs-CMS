"use client";

import { useState } from "react";

import type { ContactPageCopy } from "@/lib/contentful/types";

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

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="message"
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {status === "submitting" ? submittingLabel : submitLabel}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
