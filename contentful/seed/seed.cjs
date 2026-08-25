/**
 * Seeds the Contentful space with the content that previously lived as
 * hardcoded arrays in the page components.
 *
 * Idempotent: entries are created with fixed IDs, so re-running updates the
 * existing entry rather than creating a duplicate.
 *
 * Run with:
 *   npm run contentful:seed
 */
const SPACE = process.env.CONTENTFUL_SPACE_ID;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const LOCALE = "en-US";

if (!SPACE || !TOKEN) {
  console.error(
    "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN. See .env.example.",
  );
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

/** Wraps each field value in the locale envelope the Management API expects. */
function localise(fields) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, { [LOCALE]: value }]),
  );
}

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function upsert(contentType, id, fields) {
  const existing = await request(`/entries/${id}`);

  const entry = await request(`/entries/${id}`, {
    method: "PUT",
    headers: {
      "X-Contentful-Content-Type": contentType,
      ...(existing ? { "X-Contentful-Version": String(existing.sys.version) } : {}),
    },
    body: { fields: localise(fields) },
  });

  await request(`/entries/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(entry.sys.version) },
  });

  console.log(`  ${existing ? "updated" : "created"} ${contentType}/${id}`);
}

const services = [
  {
    id: "service-product-strategy",
    title: "Product Strategy",
    description:
      "We work with your team to define a clear roadmap grounded in real user needs, from discovery through launch planning.",
    price: "From $2,500/mo",
    order: 1,
  },
  {
    id: "service-design-engineering",
    title: "Design & Engineering",
    description:
      "From prototypes to production, we build polished, reliable software end to end — UI, backend, and everything in between.",
    price: "From $6,000/mo",
    order: 2,
  },
  {
    id: "service-growth-support",
    title: "Growth & Support",
    description:
      "Ongoing iteration, monitoring, and support to help your product grow and stay healthy after launch.",
    price: "From $1,800/mo",
    order: 3,
  },
];

const team = [
  {
    id: "team-jane-cooper",
    name: "Jane Cooper",
    designation: "Co-founder & CEO",
    bio: "Leads company strategy and partnerships, previously scaled two products from zero to a million users.",
    order: 1,
  },
  {
    id: "team-alex-rivera",
    name: "Alex Rivera",
    designation: "Head of Design",
    bio: "Sets the design direction across every product surface, with a focus on accessibility and clarity.",
    order: 2,
  },
  {
    id: "team-sam-okafor",
    name: "Sam Okafor",
    designation: "Head of Engineering",
    bio: "Owns the technical roadmap and keeps the team shipping reliable software at a sustainable pace.",
    order: 3,
  },
];

const posts = [
  {
    id: "post-scaled-to-1m-users",
    title: "How we scaled our platform to 1M users",
    slug: "how-we-scaled-our-platform-to-1m-users",
    author: "Jane Cooper",
    date: "2026-07-12",
    excerpt:
      "A look back at the architecture decisions that helped us grow without a rewrite.",
  },
  {
    id: "post-designing-for-accessibility",
    title: "Designing for accessibility from day one",
    slug: "designing-for-accessibility-from-day-one",
    author: "Alex Rivera",
    date: "2026-06-28",
    excerpt:
      "Why accessibility can't be an afterthought, and how we bake it into our process.",
  },
  {
    id: "post-remote-team-culture",
    title: "Our approach to remote team culture",
    slug: "our-approach-to-remote-team-culture",
    author: "Sam Okafor",
    date: "2026-06-03",
    excerpt:
      "The rituals and tools that keep a distributed team aligned and productive.",
  },
  {
    id: "post-guide-to-isr",
    title: "A practical guide to incremental static regeneration",
    slug: "a-practical-guide-to-incremental-static-regeneration",
    author: "Jane Cooper",
    date: "2026-05-19",
    excerpt:
      "When ISR beats full SSG or SSR, and how we use it for content that changes often.",
  },
  {
    id: "post-migrating-to-headless-cms",
    title: "What we learned migrating to a headless CMS",
    slug: "what-we-learned-migrating-to-a-headless-cms",
    author: "Alex Rivera",
    date: "2026-04-30",
    excerpt:
      "The tradeoffs of moving content out of code and into a CMS your whole team can edit.",
  },
];

async function main() {
  console.log(`Seeding space ${SPACE} (${ENV})`);

  console.log("services:");
  for (const { id, ...fields } of services) {
    await upsert("service", id, fields);
  }

  console.log("team members:");
  for (const { id, ...fields } of team) {
    await upsert("teamMember", id, fields);
  }

  console.log("blog posts:");
  for (const { id, ...fields } of posts) {
    await upsert("blogPost", id, fields);
  }

  console.log("site settings:");
  await upsert("siteSettings", "site-settings", {
    bannerTitle: "Remo",
    bannerSubtitle:
      "We help teams build, ship, and scale products with confidence.",
    missionTitle: "Our mission",
    missionBody:
      "To help teams build, ship, and scale products with confidence — combining thoughtful design with reliable engineering.",
    visionTitle: "Our vision",
    visionBody:
      "A world where every team, regardless of size, has access to the same quality of product craft as the best-funded startups.",
  });

  console.log("contact page:");
  await upsert("contactPage", "contact-page", {
    heading: "Contact us",
    submitLabel: "Send message",
    submittingLabel: "Sending…",
    successMessage: "Thanks — we'll get back to you soon.",
    errorMessage: "Something went wrong. Please try again.",
  });

  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
