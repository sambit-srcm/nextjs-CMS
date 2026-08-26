import Link from "next/link";

import { formatDate } from "@/components/format";
import {
  getPageContent,
  getPosts,
  getServices,
  getSiteSettings,
} from "@/lib/cms/queries";

export const revalidate = 60;

/** The homepage teases three of each; the section pages list them all. */
const HOME_POST_COUNT = 3;
const HOME_SERVICE_COUNT = 3;

export default async function Home() {
  const [copy, settings, topics, posts] = await Promise.all([
    getPageContent("page-home"),
    getSiteSettings(),
    getServices(HOME_SERVICE_COUNT),
    getPosts(HOME_POST_COUNT),
  ]);

  const [lead, ...recent] = posts;

  return (
    <div className="flex flex-1 flex-col">
      {settings && (
        <section className="relative overflow-hidden border-b border-line">
          {/* Soft aubergine bloom behind the masthead. Decorative only. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
          />
          <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
            {copy?.eyebrow && (
              <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
                {copy.eyebrow}
              </p>
            )}
            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-ink sm:text-6xl">
              {settings.bannerTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
              {settings.bannerSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
              >
                {copy?.primaryCtaLabel}
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
              >
                {copy?.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </section>
      )}

      {lead && (
        <section className="mx-auto w-full max-w-6xl px-6 pt-14">
          <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-8 transition-colors hover:border-accent sm:p-12">
            <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
              Latest
            </p>
            <h2 className="mt-4 max-w-3xl text-2xl leading-snug font-semibold tracking-tight text-ink sm:text-4xl">
              <Link
                href={`/blog/${lead.slug}`}
                className="after:absolute after:inset-0"
              >
                {lead.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-muted">
              {lead.excerpt}
            </p>
            <p className="mt-7 text-sm text-ink-muted">
              {lead.author}
              {lead.author && formatDate(lead.date) && " · "}
              {formatDate(lead.date)}
            </p>
          </article>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {copy?.sectionOneHeading}
            </h2>
            <Link
              href="/blog"
              className="text-sm text-accent transition-colors hover:text-accent-strong"
            >
              All articles &rarr;
            </Link>
          </div>

          {/* Two columns, not three: the lead article above takes one of the
              three posts, so this grid only ever holds the remaining two. */}
          <div className="mt-9 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {recent.map((post) => (
              <article key={post.slug} className="group relative">
                <p className="text-xs text-ink-muted">{formatDate(post.date)}</p>
                <h3 className="mt-2 text-lg leading-snug font-medium text-ink transition-colors group-hover:text-accent-strong">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-ink-muted">
                  {post.excerpt}
                </p>
                <p className="mt-3 text-xs text-ink-muted">{post.author}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {copy?.sectionTwoHeading}
            </h2>
            <Link
              href="/services"
              className="text-sm text-accent transition-colors hover:text-accent-strong"
            >
              All services &rarr;
            </Link>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent"
              >
                <h3 className="text-base font-medium text-ink">{topic.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
