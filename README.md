# Remo

Company website built with Next.js and Contentful. All page content —
banner copy, services, team, blog posts and contact wording — is managed in
Contentful rather than hardcoded in the components.

## Stack

- **Next.js 16** (App Router) with React 19
- **Tailwind CSS 4**
- **Contentful** as the headless CMS, read through the Content Delivery API

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill it in. None of these are prefixed
with `NEXT_PUBLIC_`, so they stay server-side and never reach the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `CONTENTFUL_SPACE_ID` | yes | Space to read from |
| `CONTENTFUL_DELIVERY_TOKEN` | yes | Content Delivery API token (read-only) |
| `CONTENTFUL_ENVIRONMENT` | no | Defaults to `master` |
| `CONTENTFUL_REVALIDATE_SECRET` | no | Shared secret for the publish webhook below |
| `CONTENTFUL_MANAGEMENT_TOKEN` | no | Write token, used only by the contact form endpoint |

Find these under **Settings → API keys** in Contentful.

A missing required variable throws at startup and names the variable, rather
than surfacing later as an authentication failure from the API.

## Content model

Managed in Contentful. The site reads these types:

| Type | Backs |
| --- | --- |
| `siteSettings` | Homepage banner, plus mission and vision on About |
| `service` | Services page and the services section on the homepage |
| `teamMember` | Team section on About |
| `blogPost` | Blog page and the teaser on the homepage |
| `contactPage` | Editable copy on Contact |
| `contactSubmission` | Messages sent through the contact form |

`siteSettings` and `contactPage` are singletons **by convention** — Contentful
has no built-in singleton concept, so exactly one entry of each is expected and
the queries read the first.

## Architecture notes

**Content fetching** lives in `lib/cms/`. Pages call typed functions such
as `getServices()` and receive flat shapes, never raw Contentful entries. That
mapping boundary keeps the CMS an implementation detail rather than something
every page is coupled to.

**Failures degrade rather than crash.** Queries are wrapped so a CMS outage logs
server-side and returns an empty result; pages render an explanatory empty state
instead of a 500. Entries missing a required field are skipped with a warning
naming the entry and field.

**Contact submissions** are recorded as `contactSubmission` entries and can be
read in Contentful alongside the site content. They are created **unpublished**
on purpose: enquiries are not site content, and leaving them as drafts keeps
them out of the Delivery API entirely, so a submission cannot surface publicly
through a stray query.

This is the only part of the site that writes to Contentful, and the only thing
that needs `CONTENTFUL_MANAGEMENT_TOKEN`. The token is read lazily rather than
at startup, so a deployment without it still builds and serves every page — only
the contact form fails, and it fails with a generic message while the reason
goes to the server log.

**Loading and error states** use the App Router's file conventions.
`app/loading.tsx` is the streaming fallback, `app/error.tsx` the route-level
error boundary, and `app/not-found.tsx` replaces the unstyled 404. Because
queries already degrade to empty results rather than throwing, the error
boundary catches genuine faults such as a misconfigured environment, not
routine CMS unavailability.

**Revalidation** happens two ways. Each route declares
`export const revalidate = 60`, so published changes appear within a minute on
their own. For anything faster, point a Contentful webhook at
`/api/revalidate`.

### Publish webhook

In Contentful, go to **Settings → Webhooks** and add one pointing at
`https://your-domain/api/revalidate`:

- **Events** — Entry publish and unpublish
- **Header** — `x-contentful-webhook-secret`, set to the same value as
  `CONTENTFUL_REVALIDATE_SECRET`

The route reads the content type from the payload and purges that cache tag,
which refreshes every page reading that type. Stale content keeps being served
while the fresh copy generates in the background, so a publish never leaves a
visitor waiting on a cold render.

Requests without a matching secret header are rejected with a 401. If the
secret is unset the route refuses outright rather than revalidating on
unauthenticated requests.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Deployment

Vercel auto-detects Next.js and needs no build configuration from us. The
committed `vercel.json` only pins the framework and the schema URL for editor
autocomplete; everything else is default.

### First deploy

1. In the Vercel dashboard, **Add New → Project**, and import
   `sambit-srcm/nextjs-CMS`.
2. Under **Environment Variables**, set each of these for **Production**
   (and Preview if you want branch deploys against the same space):

   | Variable | Value |
   | --- | --- |
   | `CONTENTFUL_SPACE_ID` | from Contentful → Settings → API keys |
   | `CONTENTFUL_ENVIRONMENT` | `master` |
   | `CONTENTFUL_DELIVERY_TOKEN` | Content Delivery API token |
   | `CONTENTFUL_REVALIDATE_SECRET` | generate a fresh secret — see below |

3. Deploy. The first build should succeed unchanged; Vercel picks up the
   Next.js preset, installs, builds, and serves.

### After the first deploy

Once the deploy has a public URL, wire the publish webhook so editors see their
changes immediately instead of waiting out the 60s revalidate window.

1. Generate a secret locally and set it as `CONTENTFUL_REVALIDATE_SECRET` in
   Vercel (redeploy so the new value takes effect):

   ```bash
   openssl rand -hex 32
   ```

2. In Contentful → **Settings → Webhooks**, add a webhook:
   - **URL** — `https://<your-vercel-domain>/api/revalidate`
   - **Triggers** — Entry, publish and unpublish
   - **Headers** — `x-contentful-webhook-secret`, value = the secret above

3. Publish or unpublish any entry and confirm the change appears within a
   second or two on the deployed site.

### Preview deploys

Every branch pushed to GitHub gets its own preview URL. If you point Vercel's
Preview environment at the same Contentful space as Production, previews read
the same content and the webhook affects both. Point them at a separate
Contentful environment if you want isolated staging content — the
`CONTENTFUL_ENVIRONMENT` variable exists exactly for this.

