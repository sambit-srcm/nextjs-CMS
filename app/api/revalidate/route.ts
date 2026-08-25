import { revalidateTag } from "next/cache";

/**
 * Purges cached content when an entry is published or unpublished in
 * Contentful.
 *
 * Configure a webhook in Contentful (Settings → Webhooks) pointing at this
 * route for the Entry publish and unpublish events, with a secret header
 * matching CONTENTFUL_REVALIDATE_SECRET.
 *
 * Without this the site relies solely on the 60s revalidate window on each
 * route. With it, a publish takes effect on the next request.
 */
export async function POST(request: Request) {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET;

  if (!secret) {
    console.error("CONTENTFUL_REVALIDATE_SECRET is not set; refusing to revalidate.");
    return Response.json({ error: "Not configured." }, { status: 500 });
  }

  // Compared against a header rather than a query parameter so the secret does
  // not end up in access logs.
  if (request.headers.get("x-contentful-webhook-secret") !== secret) {
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

  // Tags match the content type IDs used when fetching, so purging one type
  // refreshes every route that reads it. The "max" profile serves the stale
  // copy while the fresh one generates in the background, so an editor
  // publishing never makes a visitor wait on a cold render.
  revalidateTag(contentType, "max");

  return Response.json({ revalidated: contentType });
}
