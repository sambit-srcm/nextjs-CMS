import "server-only";

import { environment, spaceId } from "./env";
import { CmsError } from "./errors";

const MANAGEMENT_API = "https://api.contentful.com";
const LOCALE = "en-US";

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

/** Read only when saving a message, so a missing token does not break every page. */
function managementToken(): string {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

  if (!token) {
    throw new CmsError(
      "CONTENTFUL_MANAGEMENT_TOKEN is not set; cannot record contact submissions.",
    );
  }

  return token;
}

/** Saves a contact message as an unpublished Contentful entry. */
export async function createContactSubmission(
  submission: ContactSubmission,
): Promise<{ id: string }> {
  const response = await fetch(
    `${MANAGEMENT_API}/spaces/${spaceId}/environments/${environment}/entries`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${managementToken()}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Content-Type": "contactSubmission",
      },
      body: JSON.stringify({
        fields: {
          name: { [LOCALE]: submission.name },
          email: { [LOCALE]: submission.email },
          message: { [LOCALE]: submission.message },
          submittedAt: { [LOCALE]: new Date().toISOString() },
        },
      }),
    },
  );

  if (!response.ok) {
    // Keep the upstream detail in the server log, never in the HTTP response.
    throw new CmsError(
      `Contentful rejected the submission (${response.status}): ${await response.text()}`,
    );
  }

  const entry = await response.json();
  return { id: entry.sys.id };
}
