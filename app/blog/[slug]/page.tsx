import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import type { Options } from "@contentful/rich-text-react-renderer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostBySlug, getPosts } from "@/lib/cms/queries";

export const revalidate = 60;

/**
 * Prerenders every published article at build time, so each has a static HTML
 * response rather than being rendered on first request.
 */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: post.coverImage ? [{ url: post.coverImage.url }] : undefined,
    },
  };
}

/** Maps Contentful's RichText nodes onto the site's typography. */
const renderOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => (
      <strong className="font-medium text-zinc-950 dark:text-zinc-50">
        {text}
      </strong>
    ),
    [MARKS.CODE]: (text) => (
      <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-900">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {children}
      </p>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mt-10 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-8 text-lg font-medium text-zinc-950 dark:text-zinc-50">
        {children}
      </h3>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mt-4 list-disc space-y-1 pl-6 text-base text-zinc-600 dark:text-zinc-400">
        {children}
      </ul>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="mt-6 border-l-2 border-zinc-300 pl-4 text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400">
        {children}
      </blockquote>
    ),
  },
};

export default async function Article({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // An unknown slug is a genuine 404, not an empty article.
  //
  // Note this renders the not-found UI with a 200 rather than a 404 status.
  // app/loading.tsx puts this route inside a Suspense boundary, so the response
  // has already begun streaming by the time the lookup resolves, and the status
  // cannot change after that. Next injects `robots: noindex`, which is what
  // keeps the soft 404 out of search results.
  //
  // A hard 404 would mean either dropping the streaming skeleton or setting
  // `dynamicParams = false`. The latter looks tempting since every post is known
  // at build time, but it would make an article published in the CMS 404 until
  // the next deploy — which defeats the point of revalidation.
  if (!post) notFound();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50"
        >
          &larr; Back to blog
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
          {post.author}
          {post.author && post.date && " · "}
          {post.date && (
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </p>

        {post.coverImage && (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            width={post.coverImage.width ?? 1200}
            height={post.coverImage.height ?? 630}
            className="mt-8 w-full rounded-lg object-cover"
            priority
          />
        )}

        {post.body ? (
          <div className="mt-8">
            {documentToReactComponents(post.body, renderOptions)}
          </div>
        ) : (
          <p className="mt-8 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        )}
      </article>
    </div>
  );
}
