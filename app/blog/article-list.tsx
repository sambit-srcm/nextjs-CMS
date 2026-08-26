"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { formatDate } from "@/components/format";
import type { BlogPostListing } from "@/lib/cms/types";
import { filterPosts } from "@/lib/filter-posts";

/*
 * Filtering happens on the client against the already-fetched list. The
 * article set is small and fully prerendered, so querying the CMS per
 * keystroke would add latency for a result the browser already holds.
 */

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ArticleList({ posts }: { posts: BlogPostListing[] }) {
  const [query, setQuery] = useState("");

  /*
   * ISR keeps the server's HTML fresh for the next visitor; it cannot reach a
   * tab that is already open. SWR closes that gap: a reader who left this page
   * open sees a newly published article when they return to the tab, rather
   * than only after a reload.
   *
   * `fallbackData` seeds the cache with the server-rendered list, so the first
   * paint is identical to the prerendered markup — no spinner, no layout
   * shift, and a crawler sees every article. `revalidateOnMount: false` is
   * what keeps that free: SWR revalidates on mount even when fallbackData is
   * supplied, which would refetch data the page has just embedded in its HTML.
   */
  const { data } = useSWR<BlogPostListing[]>("/api/posts", fetcher, {
    fallbackData: posts,
    revalidateOnMount: false,
    refreshInterval: 60_000,
  });

  // A failed background refresh is not worth surfacing: the reader still has a
  // valid list on screen, so the last good data keeps rendering.
  const current = data ?? posts;

  const visible = useMemo(() => filterPosts(current, query), [current, query]);

  return (
    <>
      <div className="border-t border-line pt-6">
        <label htmlFor="article-search" className="sr-only">
          Search articles
        </label>
        <input
          id="article-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, author or keyword"
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-muted focus:border-accent"
        />
      </div>

      {/* Announced politely so a screen reader hears the count change without
          being interrupted on every keystroke. */}
      <p aria-live="polite" className="mt-3 text-xs text-ink-muted">
        {query.trim()
          ? `${visible.length} of ${current.length} ${
              current.length === 1 ? "article" : "articles"
            }`
          : `${current.length} ${current.length === 1 ? "article" : "articles"}`}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-ink-muted">
          Nothing matches “{query.trim()}”. Try a different term.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {visible.map((post) => (
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
    </>
  );
}
