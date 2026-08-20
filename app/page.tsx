const banner = {
  title: "Remo",
  subtitle:
    "We help teams build, ship, and scale products with confidence.",
};

const services = [
  {
    title: "Product Strategy",
    description:
      "We work with your team to define a clear roadmap grounded in real user needs.",
  },
  {
    title: "Design & Engineering",
    description:
      "From prototypes to production, we build polished, reliable software end to end.",
  },
  {
    title: "Growth & Support",
    description:
      "Ongoing iteration and support to help your product grow after launch.",
  },
];

const posts = [
  {
    title: "How we scaled our platform to 1M users",
    author: "Jane Cooper",
    date: "2026-07-12",
    excerpt:
      "A look back at the architecture decisions that helped us grow without a rewrite.",
  },
  {
    title: "Designing for accessibility from day one",
    author: "Alex Rivera",
    date: "2026-06-28",
    excerpt:
      "Why accessibility can't be an afterthought, and how we bake it into our process.",
  },
  {
    title: "Our approach to remote team culture",
    author: "Sam Okafor",
    date: "2026-06-03",
    excerpt:
      "The rituals and tools that keep a distributed team aligned and productive.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          {banner.title}
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          {banner.subtitle}
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Services
        </h2>
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

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Latest from the blog
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                {post.title}
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
    </div>
  );
}
