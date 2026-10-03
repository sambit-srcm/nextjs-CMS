import { type FieldErrors, HONEYPOT_FIELD } from "@/lib/validation/contact";

/** Failed request. `fieldErrors` is set for a 400. `message` is optional. */
type SubmitFailure = {
  ok: false;
  status: number;
  fieldErrors: FieldErrors;
  message?: string;
};

export type SubmitResult = { ok: true } | SubmitFailure;

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

/** Shown when fetch itself fails, before any HTTP status exists. */
export const OFFLINE_NOTICE =
  "Could not reach the server. Check your connection and try again.";

/** Message to show after a failed submit. Null when a field already has an error. */
export function failureNotice(
  result: SubmitFailure,
  fallback: string,
): string | null {
  // The field's own error is enough; don't show a second message.
  const hasFieldError = Object.values(result.fieldErrors).some(
    (error) => error,
  );
  if (hasFieldError) return null;

  // "Too many messages" and "too large" are worth showing as the server wrote them.
  const useServerMessage = result.status === 429 || result.status === 413;
  if (useServerMessage && result.message) return result.message;

  return fallback;
}

/** Links the message field to its counter, and to the error text when there is one. */
export function messageDescribedBy(error?: string): string {
  return error ? "message-error message-count" : "message-count";
}

/** Posts the form to /api/contact. Throws only on network failure. */
export async function submitContact(data: FormData): Promise<SubmitResult> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: text(data.get("name")),
      email: text(data.get("email")),
      message: text(data.get("message")),
      // Left untrimmed: spaces here are still a filled trap.
      [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD),
    }),
  });

  if (res.ok) return { ok: true };

  // A 400 names the fields at fault. Other errors may not even be JSON.
  let body: { fields?: FieldErrors; error?: unknown } = {};
  try {
    body = await res.json();
  } catch {
    // not JSON — keep the empty body
  }

  return {
    ok: false,
    status: res.status,
    fieldErrors: body.fields ?? {},
    message: typeof body.error === "string" ? body.error : undefined,
  };
}
