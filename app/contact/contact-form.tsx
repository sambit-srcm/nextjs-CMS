"use client";

import { useState } from "react";

import type { ContactPageCopy } from "@/lib/cms/types";
import {
  CONTACT_LIMITS,
  type FieldErrors,
  HONEYPOT_FIELD,
} from "@/lib/validation/contact";

import {
  failureNotice,
  messageDescribedBy,
  OFFLINE_NOTICE,
  submitContact,
} from "./submit-contact";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = Pick<
  ContactPageCopy,
  "submitLabel" | "submittingLabel" | "successMessage" | "errorMessage"
>;

const FIELD_CLASS =
  "w-full rounded border border-line px-3 py-2 text-sm aria-[invalid=true]:border-danger";

/** Error text under a field; its id is what the input's aria-describedby points at. */
function FieldError({ field, message }: { field: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${field}-error`} role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}

export function ContactForm({
  submitLabel,
  submittingLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [messageLength, setMessageLength] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    setNotice(null);

    const form = event.currentTarget;

    try {
      const result = await submitContact(new FormData(form));

      if (!result.ok) {
        setFieldErrors(result.fieldErrors);
        setNotice(failureNotice(result, errorMessage));
        setStatus("error");
        return;
      }

      setStatus("success");
      setMessageLength(0);
      form.reset();
    } catch (error) {
      // Network failure (offline, DNS); HTTP errors are handled above.
      console.error("Contact form submission failed:", error);
      setNotice(OFFLINE_NOTICE);
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      // Typing in a field clears that field's error from the last attempt.
      onChange={(event) => {
        // React types this as the form, but it is the field that changed.
        const target = event.target as unknown as
          HTMLInputElement | HTMLTextAreaElement;
        const name = target.name;
        if (name === "message") setMessageLength(target.value.length);
        if (name in fieldErrors)
          setFieldErrors({ ...fieldErrors, [name]: undefined });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={CONTACT_LIMITS.name}
          required
          className={FIELD_CLASS}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
        />
        <FieldError field="name" message={fieldErrors.name} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email}
          required
          className={FIELD_CLASS}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        <FieldError field="email" message={fieldErrors.email} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          required
          className={FIELD_CLASS}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={messageDescribedBy(fieldErrors.message)}
        />
        <FieldError field="message" message={fieldErrors.message} />
        <p id="message-count" className="text-right text-xs text-ink-muted">
          {messageLength} / {CONTACT_LIMITS.message}
        </p>
      </div>

      {/* Off screen on purpose. A filled-in value means the sender is a bot. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="button mt-3 disabled:opacity-50"
      >
        {status === "submitting" ? submittingLabel : submitLabel}
      </button>

      {/* role="status" / role="alert" make screen readers read the result out. */}
      {status === "success" && (
        <p role="status" className="text-sm text-accent-strong">
          {successMessage}
        </p>
      )}
      {status === "error" && notice && (
        <p role="alert" className="text-sm text-danger">
          {notice}
        </p>
      )}
    </form>
  );
}
