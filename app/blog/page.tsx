import { getPosts } from "@/lib/cms/queries";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Blog
        </h1>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            No posts have been published yet. Please check back shortly.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {post.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {post.author} &middot;{" "}
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
