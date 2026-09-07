import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
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
      <PageMasthead copy={copy} />

      <section className="mx-auto w-full max-w-4xl px-6 pb-8">
        {/* The list is fetched on the server and filtered on the client, so
            the page still prerenders with every article in the markup. The
            empty state lives in ArticleList, which also has to render it when
            a background refresh comes back with nothing. */}
        <ArticleList posts={posts} />
      </section>
    </div>
  );
}
