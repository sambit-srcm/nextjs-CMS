import Image from "next/image";

import { getSiteSettings, getTeam } from "@/lib/cms/queries";

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
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-4xl px-6 pt-20 pb-6 sm:pt-28">
        <p className="text-[0.65rem] font-medium tracking-[0.2em] text-accent uppercase">
          About
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Who writes this
        </h1>
      </section>

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
          Contributors
        </h2>
        {team.length === 0 ? (
          <p className="mt-8 text-sm text-ink-muted">
            Writer details are being updated. Please check back shortly.
          </p>
        ) : (
          <ul className="mt-9 grid gap-8 sm:grid-cols-3">
            {team.map((member) => (
              <li key={member.name}>
                {member.photo ? (
                  <Image
                    src={member.photo.url}
                    alt={member.photo.alt}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-sm font-medium text-accent-strong">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 text-base font-medium text-ink">
                  {member.name}
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
