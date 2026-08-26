import type { BlogPost } from "@/lib/cms/types";

/**
 * Narrows a list of articles by a free-text query.
 *
 * Every whitespace-separated term must appear somewhere in the title, excerpt
 * or author, so a second word narrows the result rather than widening it the
 * way a single-substring test would. Matching is case-insensitive.
 *
 * An empty or whitespace-only query returns the list untouched.
 */
export function filterPosts(posts: BlogPost[], query: string): BlogPost[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return posts;

  return posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.author]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
