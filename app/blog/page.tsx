import type { Metadata } from "next";
import { getPageContent, getPosts } from "@/lib/cms/queries";

import { ArticleList } from "./article-list";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default async function Blog() {
  const [copy, posts] = await Promise.all([
    getPageContent("page-blog"),
    getPosts(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-4xl px-6 pt-20 pb-6 sm:pt-28">
        {copy?.eyebrow && (
          <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
            {copy.eyebrow}
          </p>
        )}
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {copy?.heading}
        </h1>
        {copy?.intro && (
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
            {copy.intro}
          </p>
        )}
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
