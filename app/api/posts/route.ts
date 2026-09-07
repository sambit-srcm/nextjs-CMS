import { getPostsOrThrow } from "@/lib/cms/queries";
import type { BlogPostListing } from "@/lib/cms/types";

/**
 * The article list, as JSON, for the blog page's background refresh.
 *
 * The browser cannot read Contentful directly: the delivery token is not
 * prefixed with NEXT_PUBLIC_ and lib/cms/client.ts carries a `server-only`
 * guard, so a client fetch would mean publishing the token to every visitor.
 * This handler holds it server-side and returns only what the listing renders.
 *
 * Declares the same 60s window as the page, so a build that reaches the CMS
 * prerenders this response and serves it from the cache. A build that does not
 * leaves the route dynamic, which costs a re-run of the handler rather than a
 * request to Contentful: `fetchEntries` reads through Next's data cache under
 * the `blogPost` tag either way, so polling tabs do not reach the CMS and the
 * publish webhook at /api/revalidate still purges what they read.
 */
export const revalidate = 60;

export async function GET() {
  let posts;

  try {
    // `getPostsOrThrow` rather than `getPosts`: the latter degrades to an
    // empty list, which would reach the page as a successful response and
    // replace a list the reader can already see with an empty state. A
    // refresh that could not reach the CMS has to say so.
    posts = await getPostsOrThrow();
  } catch (error) {
    console.error("Blog listing refresh failed", error);
    return Response.json(
      { error: "Could not reach the article list." },
      { status: 503 },
    );
  }

  // Listed field by field rather than by omitting the fields the listing does
  // not render, so a field added to BlogPost is a deliberate decision here
  // rather than something silently polled every minute. The body is a full
  // rich-text document, and the cover image is only ever shown on the article
  // page — neither is worth sending to every open tab.
  const listing: BlogPostListing[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    author: post.author,
    date: post.date,
    excerpt: post.excerpt,
  }));

  return Response.json(listing);
}
