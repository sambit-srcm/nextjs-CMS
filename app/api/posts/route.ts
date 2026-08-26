import { getPosts } from "@/lib/cms/queries";
import type { BlogPostListing } from "@/lib/cms/types";

/**
 * The article list, as JSON, for the blog page's background refresh.
 *
 * The browser cannot read Contentful directly: the delivery token is not
 * prefixed with NEXT_PUBLIC_ and lib/cms/client.ts carries a `server-only`
 * guard, so a client fetch would mean publishing the token to every visitor.
 * This handler holds it server-side and returns only what the listing renders.
 *
 * Cached for the same 60s as the page. Without that, every open tab polling
 * this endpoint would reach Contentful directly; with it, the publish webhook
 * at /api/revalidate purges this response along with the pages, because both
 * read through the same `blogPost` cache tag.
 */
export const revalidate = 60;

export async function GET() {
  const posts = await getPosts();

  // Listed field by field rather than by omitting `body`, so a field added to
  // BlogPost is a deliberate decision here rather than silently polled. `body`
  // is a full rich-text document the listing never renders.
  const listing: BlogPostListing[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    author: post.author,
    date: post.date,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
  }));

  return Response.json(listing);
}
