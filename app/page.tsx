import Link from "next/link";

import { getPosts, getServices, getSiteSettings } from "@/lib/cms/queries";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

/** The homepage teases the three most recent posts; /blog lists them all. */
const LATEST_POST_COUNT = 3;

export default async function Home() {
  const [settings, services, posts] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getPosts(LATEST_POST_COUNT),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {settings && (
        <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            {settings.bannerTitle}
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {settings.bannerSubtitle}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/services"
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Explore our services
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              Get in touch
            </Link>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              Services
            </h2>
            <Link
              href="/services"
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              All services &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              Latest from the blog
            </h2>
            <Link
              href="/blog"
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              All posts &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="relative rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="after:absolute after:inset-0 hover:underline"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {post.author} &middot;{" "}
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
