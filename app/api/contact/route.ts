import { CmsError } from "@/lib/cms/errors";
import { createContactSubmission } from "@/lib/cms/submissions";

/** Caps mirror the content model and keep an oversized body from reaching Contentful. */
const LIMITS = { name: 100, email: 254, message: 5000 } as const;

/**
 * Deliberately permissive: the goal is to reject obvious typos, not to police
 * valid addresses. Strict patterns reject deliverable addresses more often than
 * they catch bad ones.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const message = asTrimmedString(body.message);

  if (!name || !email || !message) {
    return Response.json(
      { error: "Name, email, and message are all required." },
      { status: 400 },
    );
  }

  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return Response.json(
      { error: "One or more fields exceed the maximum length." },
      { status: 400 },
    );
  }

  if (!EMAIL.test(email)) {
    return Response.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  try {
    const { id } = await createContactSubmission({ name, email, message });
    console.log("Contact submission recorded:", id);
    return Response.json({ ok: true });
  } catch (error) {
    // The reason belongs in the server log. Returning it would expose whether a
    // token is missing or invalid to anyone who can post to this endpoint.
    console.error(
      error instanceof CmsError ? error.message : "Contact submission failed",
      error,
    );
    return Response.json(
      { error: "Could not send your message. Please try again later." },
      { status: 502 },
    );
  }
}
