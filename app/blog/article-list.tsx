"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import { formatDate } from "@/components/format";
import type { BlogPostListing } from "@/lib/cms/types";
import { filterPosts } from "@/lib/filter-posts";

/* Search runs in the browser. The article list is already loaded. */

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ArticleList({ posts }: { posts: BlogPostListing[] }) {
  const [query, setQuery] = useState("");

  /* Start from the server-rendered list, then refresh it in the background. */
  const { data } = useSWR<BlogPostListing[]>("/api/posts", fetcher, {
    fallbackData: posts,
    revalidateOnMount: false,
    refreshInterval: 60_000,
  });

  // If the refresh fails, keep showing the list we already have.
  const current = data ?? posts;

  const visible = filterPosts(current, query);

  // e.g. "5 articles", or "2 of 5 articles" while searching.
  const noun = current.length === 1 ? "article" : "articles";
  let countText = `${current.length} ${noun}`;
  if (query.trim()) countText = `${visible.length} of ${countText}`;

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
          className="w-full rounded border border-line px-3 py-2 text-sm"
        />
      </div>

      {/* Polite, so the count is read out without interrupting typing. */}
      <p aria-live="polite" className="mt-3 text-xs text-ink-muted">
        {countText}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-ink-muted">
          Nothing matches “{query.trim()}”. Try a different term.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {visible.map((post) => (
            <li key={post.slug}>
              <article className="py-8">
                <p className="text-sm text-ink-muted">
                  {formatDate(post.date)}
                  {post.author && post.date && " · "}
                  {post.author}
                </p>
                <h2 className="mt-2 text-xl font-medium">
                  <Link href={`/blog/${post.slug}`} className="underline">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 max-w-2xl text-ink-muted">{post.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
