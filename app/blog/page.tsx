const posts = [
  {
    title: "How we scaled our platform to 1M users",
    author: "Jane Cooper",
    date: "2026-07-12",
    excerpt:
      "A look back at the architecture decisions that helped us grow without a rewrite.",
  },
  {
    title: "Designing for accessibility from day one",
    author: "Alex Rivera",
    date: "2026-06-28",
    excerpt:
      "Why accessibility can't be an afterthought, and how we bake it into our process.",
  },
  {
    title: "Our approach to remote team culture",
    author: "Sam Okafor",
    date: "2026-06-03",
    excerpt:
      "The rituals and tools that keep a distributed team aligned and productive.",
  },
  {
    title: "A practical guide to incremental static regeneration",
    author: "Jane Cooper",
    date: "2026-05-19",
    excerpt:
      "When ISR beats full SSG or SSR, and how we use it for content that changes often.",
  },
  {
    title: "What we learned migrating to a headless CMS",
    author: "Alex Rivera",
    date: "2026-04-30",
    excerpt:
      "The tradeoffs of moving content out of code and into a CMS your whole team can edit.",
  },
];

export default function Blog() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Blog
        </h1>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <article
              key={post.title}
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
      </section>
    </div>
  );
}
