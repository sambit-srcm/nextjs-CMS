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
      <strong className="font-medium text-ink">
        {text}
      </strong>
    ),
    [MARKS.CODE]: (text) => (
      <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[0.9em] text-accent-strong">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mt-5 text-[1.0625rem] leading-8 text-ink-muted">
        {children}
      </p>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mt-12 text-xl font-semibold tracking-tight text-ink">
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-10 text-lg font-medium text-ink">
        {children}
      </h3>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 text-[1.0625rem] leading-8 text-ink-muted marker:text-accent">
        {children}
      </ul>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="mt-8 border-l-2 border-accent pl-5 text-lg leading-8 text-ink italic">
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
    <div className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-2xl px-6 pt-20 pb-16 sm:pt-28">
        <Link
          href="/blog"
          className="text-sm text-accent transition-colors hover:text-accent-strong"
        >
          &larr; Back to blog
        </Link>

        <h1 className="mt-8 text-3xl leading-[1.12] font-semibold tracking-tight text-ink sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-5 text-sm text-ink-muted">
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
            className="mt-10 w-full rounded-xl object-cover"
            priority
          />
        )}

        {post.body ? (
          <div className="mt-8">
            {documentToReactComponents(post.body, renderOptions)}
          </div>
        ) : (
          <p className="mt-8 text-[1.0625rem] leading-8 text-ink-muted">
            {post.excerpt}
          </p>
        )}
      </article>
    </div>
  );
}
