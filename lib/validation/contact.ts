import { z } from "zod";

/** Field limits, shared with the form's `maxLength` attributes. */
export const CONTACT_LIMITS = { name: 100, email: 254, message: 5000 } as const;

/** Hidden form field. If it is filled in, the message is treated as spam. */
export const HONEYPOT_FIELD = "website";

/** Rules for a contact message. Shared by the form and the API. */
export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(
      CONTACT_LIMITS.name,
      `Name must be ${CONTACT_LIMITS.name} characters or fewer.`,
    ),

  // Catches obvious typos. A stricter pattern rejects real addresses.
  email: z
    .email("Please provide a valid email address.")
    .max(
      CONTACT_LIMITS.email,
      `Email must be ${CONTACT_LIMITS.email} characters or fewer.`,
    ),

  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(
      CONTACT_LIMITS.message,
      `Message must be ${CONTACT_LIMITS.message} characters or fewer.`,
    ),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

/** First error per field, in the shape the API returns to the client. */
export type FieldErrors = Partial<Record<keyof ContactSubmissionInput, string>>;

export function toFieldErrors(
  error: z.ZodError<ContactSubmissionInput>,
): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  const errors: FieldErrors = {};

  // Keep only the first message for each field.
  if (fieldErrors.name) errors.name = fieldErrors.name[0];
  if (fieldErrors.email) errors.email = fieldErrors.email[0];
  if (fieldErrors.message) errors.message = fieldErrors.message[0];

  return errors;
}
