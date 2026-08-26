import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/components/format";
import { getPosts, getTeam, getTeamMember } from "@/lib/cms/queries";

export const revalidate = 60;

/** Prerenders a page per writer, so each is static rather than built on first request. */
export async function generateStaticParams() {
  const team = await getTeam();
  return team.map((member) => ({ id: member.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/team/[id]">): Promise<Metadata> {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) return { title: "Writer not found" };

  return {
    title: `${member.name} — Circuit`,
    description: `${member.designation} at Circuit. ${member.bio}`.slice(
      0,
      200,
    ),
    openGraph: {
      title: member.name,
      description: member.designation,
      type: "profile",
      images: member.photo ? [{ url: member.photo.url }] : undefined,
    },
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default async function Writer({ params }: PageProps<"/team/[id]">) {
  const { id } = await params;

  // Both are needed regardless, and neither depends on the other.
  const [member, posts] = await Promise.all([getTeamMember(id), getPosts()]);

  // An unknown id is a genuine 404, not an empty profile.
  //
  // As on the article route, this renders the not-found UI with a 200 rather
  // than a 404 status: app/loading.tsx opens a Suspense boundary, so the
  // response has begun streaming before the lookup resolves. Next injects
  // `robots: noindex`, which is what keeps it out of search results.
  if (!member) notFound();

  const written = posts.filter((post) => post.author === member.name);

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-3xl px-6 pt-20 pb-8 sm:pt-28">
        <Link
          href="/about"
          className="text-sm text-accent transition-colors hover:text-accent-strong"
        >
          &larr; All writers
        </Link>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          {member.photo ? (
            <Image
              src={member.photo.url}
              alt={member.photo.alt}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-xl font-medium text-accent-strong">
              {initials(member.name)}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {member.name}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-accent">
              {member.designation}
            </p>
          </div>
        </div>

        {member.bio && (
          <p className="mt-8 text-[1.0625rem] leading-8 text-ink-muted">
            {member.bio}
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-8">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {written.length > 0
            ? `Articles by ${member.name.split(" ")[0]}`
            : "Articles"}
        </h2>

        {written.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            No published articles yet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {written.map((post) => (
              <li key={post.slug}>
                <article className="group relative py-7">
                  <p className="text-xs text-ink-muted">
                    {formatDate(post.date)}
                  </p>
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
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
