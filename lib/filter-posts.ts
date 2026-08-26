/** The fields the search reads. Anything carrying these can be filtered. */
type Searchable = { title: string; excerpt: string; author: string };

/**
 * Narrows a list of articles by a free-text query.
 *
 * Every whitespace-separated term must appear somewhere in the title, excerpt
 * or author, so a second word narrows the result rather than widening it the
 * way a single-substring test would. Matching is case-insensitive.
 *
 * An empty or whitespace-only query returns the list untouched.
 *
 * Generic over the item so it serves both the full post and the trimmed
 * listing shape the blog page polls, without either needing a second copy.
 */
export function filterPosts<T extends Searchable>(
  posts: T[],
  query: string,
): T[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return posts;

  return posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.author]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
