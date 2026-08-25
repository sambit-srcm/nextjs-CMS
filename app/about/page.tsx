import Image from "next/image";

import { getSiteSettings, getTeam } from "@/lib/contentful/queries";

// The Contentful SDK runs on axios rather than fetch, so Next's fetch cache
// does not apply. Revalidation has to be declared at the segment level.
export const revalidate = 60;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default async function About() {
  const [settings, team] = await Promise.all([getSiteSettings(), getTeam()]);

  const statements = [
    { title: settings?.missionTitle, body: settings?.missionBody },
    { title: settings?.visionTitle, body: settings?.visionBody },
  ].filter((item): item is { title: string; body: string } =>
    Boolean(item.title && item.body),
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          About us
        </h1>
      </section>

      {statements.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {statements.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Team
        </h2>
        {team.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
            Team details are being updated. Please check back shortly.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {member.photo ? (
                  <Image
                    src={member.photo.url}
                    alt={member.photo.alt}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {member.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {member.designation}
                </p>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
