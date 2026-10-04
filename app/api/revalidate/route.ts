import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

/** Compares the webhook secret without leaking how much of a guess matched. */
function secretMatches(provided: string | null, expected: string): boolean {
  if (provided === null) return false;

  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();

  return timingSafeEqual(a, b);
}

/** Clears the cache when Contentful publishes or unpublishes an entry. */
export async function POST(request: Request) {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET;

  if (!secret) {
    console.error(
      "CONTENTFUL_REVALIDATE_SECRET is not set; refusing to revalidate.",
    );
    return Response.json({ error: "Not configured." }, { status: 500 });
  }

  // Read from a header, not the URL, so the secret stays out of access logs.
  if (
    !secretMatches(request.headers.get("x-contentful-webhook-secret"), secret)
  ) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let contentType: string | undefined;

  try {
    const payload = await request.json();
    contentType = payload?.sys?.contentType?.sys?.id;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!contentType) {
    return Response.json(
      { error: "Payload did not identify a content type." },
      { status: 400 },
    );
  }

  // Tag = content type id; "max" serves the old copy while the new one renders.
  revalidateTag(contentType, "max");

  return Response.json({ revalidated: contentType });
}
