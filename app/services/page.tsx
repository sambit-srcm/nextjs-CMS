import type { Metadata } from "next";
import Image from "next/image";

import { getPageContent, getServices } from "@/lib/cms/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
};

export default async function Topics() {
  const [copy, topics] = await Promise.all([
    getPageContent("page-services"),
    getServices(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-6 sm:pt-28">
        {copy?.eyebrow && (
          <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
            {copy.eyebrow}
          </p>
        )}
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {copy?.heading}
        </h1>
        {copy?.intro && (
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
            {copy.intro}
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-8">
        {topics.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Services are being updated. Please check back shortly.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-3">
            {topics.map((topic) => (
              <article
                key={topic.title}
                className="overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent"
              >
                {topic.image ? (
                  <div className="relative h-36 w-full">
                    <Image
                      src={topic.image.url}
                      // Decorative: the service title follows it.
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-accent-soft to-surface-raised" />
                )}
                <div className="p-6">
                  <h2 className="text-base font-medium text-ink">
                    {topic.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-6 text-ink-muted">
                    {topic.description}
                  </p>
                  {topic.price && (
                    <p className="mt-4 text-sm font-medium text-accent">
                      {topic.price}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
