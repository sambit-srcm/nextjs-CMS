import Link from "next/link";

import { formatDate } from "@/components/format";
import { getPosts } from "@/lib/cms/queries";

export const revalidate = 60;

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-4xl px-6 pt-20 pb-6 sm:pt-28">
        <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
          Reviews &amp; news
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Everything we&apos;ve published
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
          Phone reviews, launch coverage, and what changes for the people who
          actually use these devices.
        </p>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-8">
        {posts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No articles have been published yet. Please check back shortly.
          </p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="group relative py-9">
                  <p className="text-xs text-ink-muted">
                    {formatDate(post.date)}
                    {post.author && post.date && " · "}
                    {post.author}
                  </p>
                  <h2 className="mt-2.5 text-xl leading-snug font-medium tracking-tight text-ink transition-colors group-hover:text-accent-strong sm:text-2xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3.5 max-w-2xl text-base leading-7 text-ink-muted">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-sm font-medium text-accent">
                    Read article &rarr;
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
