/** The fields the search reads. Anything carrying these can be filtered. */
type Searchable = { title: string; excerpt: string; author: string };

/** Keeps posts whose title, excerpt, or author contain every search word. */
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
