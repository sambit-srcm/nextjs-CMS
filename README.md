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
| `CONTENTFUL_MANAGEMENT_TOKEN` | no | Only for the migration and seed scripts below |

Find the first three under **Settings → API keys** in Contentful. The
management token is on the **Content management tokens** tab of the same page.

A missing required variable throws at startup and names the variable, rather
than surfacing later as an authentication failure from the API.

## Content model

Defined as code in `contentful/migrations/` so model changes are reviewable and
can be replayed against a fresh environment.

| Type | Backs |
| --- | --- |
| `siteSettings` | Homepage banner, plus mission and vision on About |
| `service` | Services page and the services section on the homepage |
| `teamMember` | Team section on About |
| `blogPost` | Blog page and the teaser on the homepage |
| `contactPage` | Editable copy on Contact |

`siteSettings` and `contactPage` are singletons **by convention** — Contentful
has no built-in singleton concept, so exactly one entry of each is expected and
the queries read the first.

### Setting up a new environment

```bash
npm run contentful:migrate   # create the content types
npm run contentful:seed      # populate them with the initial content
```

Both need `CONTENTFUL_MANAGEMENT_TOKEN`. The seed is idempotent — entries use
fixed IDs and are upserted, so re-running updates in place rather than
duplicating. Note that it re-applies the *initial* content, so running it
against a space with live edits will overwrite them. Treat it as bootstrap for
a new environment, not a routine command.

## Architecture notes

**Content fetching** lives in `lib/contentful/`. Pages call typed functions such
as `getServices()` and receive flat shapes, never raw Contentful entries. That
mapping boundary keeps the CMS an implementation detail rather than something
every page is coupled to.

**Failures degrade rather than crash.** Queries are wrapped so a CMS outage logs
server-side and returns an empty result; pages render an explanatory empty state
instead of a 500. Entries missing a required field are skipped with a warning
naming the entry and field.

**Revalidation is declared per route segment** (`export const revalidate = 60`),
so published changes appear within a minute without a redeploy.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run contentful:migrate` | Apply content model migrations |
| `npm run contentful:seed` | Seed or refresh initial content |
