import { z } from "zod";

/**
 * Shape of a contact form submission.
 *
 * Deliberately free of `server-only` so the same schema can validate on the
 * client before a request is made, keeping one definition rather than two that
 * can drift apart.
 *
 * Limits mirror the Contentful content model, so an oversized field is rejected
 * here rather than by the CMS after a round trip.
 */
export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),

  // Permissive by design: the goal is catching typos, not policing valid
  // addresses. Strict patterns reject deliverable addresses more often than
  // they catch bad ones.
  email: z
    .email("Please provide a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),

  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(5000, "Message must be 5000 characters or fewer."),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

/** First error per field, in the shape the API returns to the client. */
export type FieldErrors = Partial<
  Record<keyof ContactSubmissionInput, string>
>;

export function toFieldErrors(
  error: z.ZodError<ContactSubmissionInput>,
): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  const errors: FieldErrors = {};

  for (const field of ["name", "email", "message"] as const) {
    const [first] = fieldErrors[field] ?? [];
    if (first) errors[field] = first;
  }

  return errors;
}
