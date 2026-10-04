import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Options } from "@contentful/rich-text-react-renderer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostBySlug, getPosts } from "@/lib/cms/queries";
import { isExternalHref, safeHref } from "@/lib/safe-href";

export const revalidate = 60;

/** Build every published article ahead of time. */
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
    alternates: { canonical: `/blog/${slug}` },
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
      <strong className="font-medium text-ink">{text}</strong>
    ),
    [MARKS.CODE]: (text) => (
      <code className="rounded bg-surface-raised px-1 font-mono text-sm">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mt-4 text-ink-muted">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mt-8 text-xl font-semibold">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-10 text-lg font-medium text-ink">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-muted">
        {children}
      </ul>
    ),
    // Underlined links. Unsafe targets, such as javascript:, are plain text.
    [INLINES.HYPERLINK]: (node, children) => {
      const href = safeHref(node.data.uri);
      if (!href) return <>{children}</>;

      return (
        <a
          href={href}
          rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
          className="underline"
        >
          {children}
        </a>
      );
    },
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="mt-6 border-l-2 border-line pl-4 italic">
        {children}
      </blockquote>
    ),
  },
};

export default async function Article({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Unknown slug. Shows the not-found page.
  if (!post) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href="/blog" className="text-sm underline">
          &larr; Back to blog
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">{post.title}</h1>

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
            // Decorative: it illustrates the headline above it.
            alt=""
            width={post.coverImage.width ?? 1200}
            height={post.coverImage.height ?? 630}
            className="mt-10 w-full rounded-xl object-cover"
            // Load this image first. It is the largest thing on the page.
            loading="eager"
            fetchPriority="high"
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
