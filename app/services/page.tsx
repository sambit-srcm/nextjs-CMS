const services = [
  {
    title: "Product Strategy",
    description:
      "We work with your team to define a clear roadmap grounded in real user needs, from discovery through launch planning.",
    price: "From $2,500/mo",
  },
  {
    title: "Design & Engineering",
    description:
      "From prototypes to production, we build polished, reliable software end to end — UI, backend, and everything in between.",
    price: "From $6,000/mo",
  },
  {
    title: "Growth & Support",
    description:
      "Ongoing iteration, monitoring, and support to help your product grow and stay healthy after launch.",
    price: "From $1,800/mo",
  },
];

export default function Services() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Services
        </h1>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-100 text-sm font-medium text-zinc-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400">
                {service.title}
              </div>
              <div className="p-6">
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {service.description}
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {service.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
