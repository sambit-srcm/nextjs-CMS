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
        <section className="border-b border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            {copy?.eyebrow && (
              <p className="text-sm text-ink-muted">{copy.eyebrow}</p>
            )}
            <h1 className="mt-3 text-3xl font-semibold">
              {settings.bannerTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              {settings.bannerSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/blog" className="button">
                {copy?.primaryCtaLabel}
              </Link>
              <Link href="/about" className="button-secondary">
                {copy?.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </section>
      )}

      {lead && (
        <section className="mx-auto w-full max-w-6xl px-6 pt-14">
          <article className="box">
            <p className="text-sm text-ink-muted">Latest</p>
            <h2 className="mt-2 text-2xl font-semibold">
              <Link href={`/blog/${lead.slug}`} className="underline">
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
            <h2 className="text-xl font-semibold">{copy?.sectionOneHeading}</h2>
            <Link href="/blog" className="text-sm underline">
              All articles &rarr;
            </Link>
          </div>

          {/* Two columns: the lead article above takes one of the three posts. */}
          <div className="mt-9 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {recent.map((post) => (
              <article key={post.slug}>
                <p className="text-sm text-ink-muted">
                  {formatDate(post.date)}
                </p>
                <h3 className="mt-2 text-lg font-medium">
                  <Link href={`/blog/${post.slug}`} className="underline">
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
            <h2 className="text-xl font-semibold">{copy?.sectionTwoHeading}</h2>
            <Link href="/services" className="text-sm underline">
              All services &rarr;
            </Link>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {topics.map((topic) => (
              <div key={topic.title} className="box">
                <h3 className="text-base font-medium text-ink">
                  {topic.title}
                </h3>
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
