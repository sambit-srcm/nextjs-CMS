import { getPosts } from "@/lib/cms/queries";
import type { BlogPostListing } from "@/lib/cms/types";

/** Article list as JSON, so the blog page can refresh without the CMS token. */
export const revalidate = 60;

export async function GET() {
  const posts = await getPosts();

  // Leave out the article body. The list does not render it.
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
