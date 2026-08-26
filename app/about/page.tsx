import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { initials } from "@/components/format";
import { PageMasthead } from "@/components/page-masthead";
import { getPageContent, getSiteSettings, getTeam } from "@/lib/cms/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
};

export default async function About() {
  const [copy, settings, team] = await Promise.all([
    getPageContent("page-about"),
    getSiteSettings(),
    getTeam(),
  ]);

  const statements = [
    { title: settings?.missionTitle, body: settings?.missionBody },
    { title: settings?.visionTitle, body: settings?.visionBody },
  ].filter((item): item is { title: string; body: string } =>
    Boolean(item.title && item.body),
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageMasthead copy={copy} />

      {statements.length > 0 && (
        <section className="mx-auto w-full max-w-4xl px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {statements.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-line bg-surface p-7"
              >
                <h2 className="text-base font-medium text-accent-strong">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-4xl px-6 py-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {copy?.sectionOneHeading}
        </h2>
        {team.length === 0 ? (
          <p className="mt-8 text-sm text-ink-muted">
            Writer details are being updated. Please check back shortly.
          </p>
        ) : (
          <ul className="mt-9 grid gap-8 sm:grid-cols-3">
            {team.map((member) => (
              <li key={member.id} className="group relative">
                {member.photo ? (
                  <Image
                    src={member.photo.url}
                    // Decorative: the writer's name is the heading directly
                    // below, so alt text here would either repeat it or, as
                    // happened with stale CMS descriptions, contradict it.
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-sm font-medium text-accent-strong">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 text-base font-medium text-ink transition-colors group-hover:text-accent-strong">
                  <Link
                    href={`/team/${member.id}`}
                    className="after:absolute after:inset-0"
                  >
                    {member.name}
                  </Link>
                </h3>
                <p className="text-sm text-accent">{member.designation}</p>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {member.bio}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
