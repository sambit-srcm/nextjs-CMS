import { CmsError } from "@/lib/cms/errors";
import { createContactSubmission } from "@/lib/cms/submissions";
import {
  contactSubmissionSchema,
  toFieldErrors,
} from "@/lib/validation/contact";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = contactSubmissionSchema.safeParse(payload);

  if (!result.success) {
    // Field-level errors so the form can mark the offending input, rather than
    // showing one message for whatever happened to fail first.
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
