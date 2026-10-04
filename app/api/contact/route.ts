import { CmsError } from "@/lib/cms/errors";
import { createContactSubmission } from "@/lib/cms/submissions";
import { clientIp, contactRateLimit } from "@/lib/rate-limit";
import {
  contactSubmissionSchema,
  HONEYPOT_FIELD,
  toFieldErrors,
} from "@/lib/validation/contact";

/** Reject bodies bigger than a real contact message. */
const MAX_BODY_BYTES = 16 * 1024;

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/** True when the hidden spam-trap field has something typed in it. */
function isSpam(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;

  const trap = (payload as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof trap === "string" && trap.trim() !== "";
}

export async function POST(request: Request) {
  // JSON only. A form on another site cannot send this content type.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  // Block posts from another site. Requests with no Origin are allowed.
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Message is too large." }, { status: 413 });
  }

  const limit = contactRateLimit.check(clientIp(request));
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many messages. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let payload: unknown;

  try {
    // Cap the body even when Content-Length is missing.
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ error: "Message is too large." }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Filled spam trap: pretend it worked and save nothing.
  if (isSpam(payload)) {
    console.log("Contact submission dropped: spam trap filled");
    return Response.json({ ok: true });
  }

  const result = contactSubmissionSchema.safeParse(payload);

  if (!result.success) {
    // Per-field errors so the form can mark each input.
    return Response.json(
      {
        error: "Please correct the highlighted fields.",
        fields: toFieldErrors(result.error),
      },
      { status: 400 },
    );
  }

  try {
    const { id } = await createContactSubmission(result.data);
    console.log("Contact submission recorded:", id);
    return Response.json({ ok: true });
  } catch (error) {
    // Log the real reason; don't reveal it to the caller.
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
