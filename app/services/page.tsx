import Image from "next/image";

import { getServices } from "@/lib/cms/queries";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

export default async function Services() {
  const services = await getServices();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Services
        </h1>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        {services.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            Our services are being updated. Please check back shortly.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                {service.image ? (
                  <div className="relative h-32 w-full">
                    <Image
                      src={service.image.url}
                      alt={service.image.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-medium text-zinc-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400">
                    {service.title}
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {service.description}
                  </p>
                  {service.price && (
                    <p className="mt-4 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {service.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
