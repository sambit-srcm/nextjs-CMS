"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatDate } from "@/components/format";
import type { BlogPost } from "@/lib/cms/types";
import { filterPosts } from "@/lib/filter-posts";

/*
 * Filtering happens on the client against the already-fetched list. The
 * article set is small and fully prerendered, so querying the CMS per
 * keystroke would add latency for a result the browser already holds.
 */

export function ArticleList({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => filterPosts(posts, query), [posts, query]);

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
          ? `${visible.length} of ${posts.length} ${
              posts.length === 1 ? "article" : "articles"
            }`
          : `${posts.length} ${posts.length === 1 ? "article" : "articles"}`}
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
