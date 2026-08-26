import { getPosts } from "@/lib/cms/queries";

import { ArticleList } from "./article-list";

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
          /* The list is fetched on the server and filtered on the client, so
             the page still prerenders with every article in the markup. */
          <ArticleList posts={posts} />
        )}
      </section>
    </div>
  );
}
