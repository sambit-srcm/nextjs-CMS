import "server-only";

import type { AssetLink, EntryCollection, RawAsset } from "./client";
import { fetchEntries } from "./client";
import { withFallback } from "./errors";
import type {
  BlogPost,
  BlogPostFields,
  ContactPageCopy,
  ContactPageFields,
  CmsImage,
  PageContent,
  PageContentFields,
  Service,
  ServiceFields,
  SiteSettings,
  SiteSettingsFields,
  TeamMember,
  TeamMemberFields,
} from "./types";
import { optionalString, requiredString } from "./validate";

/**
 * Resolves an asset link against the `includes.Asset` block.
 *
 * Unlike the SDK, the REST API does not inline linked assets — it returns the
 * link on the field and the asset itself alongside the entries. An asset that
 * is unpublished or otherwise unresolvable is simply absent, which is why a
 * miss yields null rather than throwing.
 */
function resolveImage(
  link: AssetLink | undefined,
  assets: RawAsset[] | undefined,
  fallbackAlt: string,
): CmsImage | null {
  if (!link?.sys?.id || !assets) return null;

  const asset = assets.find((candidate) => candidate.sys.id === link.sys.id);
  const file = asset?.fields?.file;
  if (!file?.url) return null;

  const dimensions = file.details?.image;

  return {
    // Asset URLs come back protocol-relative (`//images.ctfassets.net/…`).
    url: file.url.startsWith("//") ? `https:${file.url}` : file.url,
    alt: asset?.fields?.description || asset?.fields?.title || fallbackAlt,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

function assets<T>(collection: EntryCollection<T>): RawAsset[] | undefined {
  return collection.includes?.Asset;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return withFallback(
    "getSiteSettings",
    async () => {
      const data = await fetchEntries<SiteSettingsFields>("siteSettings", {
        limit: 1,
      });

      const entry = data.items[0];
      if (!entry) {
        console.warn("No siteSettings entry published in Contentful.");
        return null;
      }

      const f = entry.fields;
      const bannerTitle = requiredString(
        f.bannerTitle,
        "bannerTitle",
        entry.sys.id,
      );
      if (!bannerTitle) return null;

      return {
        siteName: optionalString(f.siteName),
        siteTagline: optionalString(f.siteTagline),
        footerTagline: optionalString(f.footerTagline),
        metaDescription: optionalString(f.metaDescription),
        bannerTitle,
        bannerSubtitle: optionalString(f.bannerSubtitle),
        missionTitle: optionalString(f.missionTitle),
        missionBody: optionalString(f.missionBody),
        visionTitle: optionalString(f.visionTitle),
        visionBody: optionalString(f.visionBody),
      };
    },
    null,
  );
}

export async function getPosts(limit?: number): Promise<BlogPost[]> {
  return withFallback(
    "getPosts",
    async () => {
      const data = await fetchEntries<BlogPostFields>("blogPost", {
        order: "-fields.date",
        limit,
      });

      return data.items.flatMap((entry) => {
        const f = entry.fields;
        const title = requiredString(f.title, "title", entry.sys.id);
        const slug = requiredString(f.slug, "slug", entry.sys.id);
        if (!title || !slug) return [];

        return [
          {
            title,
            slug,
            author: optionalString(f.author),
            date: optionalString(f.date),
            excerpt: optionalString(f.excerpt),
            coverImage: resolveImage(f.coverImage, assets(data), title),
            body: f.body ?? null,
          },
        ];
      });
    },
    [],
  );
}

export async function getServices(limit?: number): Promise<Service[]> {
  return withFallback(
    "getServices",
    async () => {
      const data = await fetchEntries<ServiceFields>("service", {
        order: "fields.order",
        ...(limit ? { limit } : {}),
      });

      return data.items.flatMap((entry) => {
        const f = entry.fields;
        const title = requiredString(f.title, "title", entry.sys.id);
        const description = requiredString(
          f.description,
          "description",
          entry.sys.id,
        );
        if (!title || !description) return [];

        return [
          {
            title,
            description,
            price: optionalString(f.price),
            image: resolveImage(f.image, assets(data), title),
          },
        ];
      });
    },
    [],
  );
}

export async function getTeam(): Promise<TeamMember[]> {
  return withFallback(
    "getTeam",
    async () => {
      const data = await fetchEntries<TeamMemberFields>("teamMember", {
        order: "fields.order",
      });

      return data.items.flatMap((entry) => {
        const f = entry.fields;
        const name = requiredString(f.name, "name", entry.sys.id);
        const designation = requiredString(
          f.designation,
          "designation",
          entry.sys.id,
        );
        if (!name || !designation) return [];

        return [
          {
            id: entry.sys.id,
            name,
            designation,
            bio: optionalString(f.bio),
            photo: resolveImage(f.photo, assets(data), name),
          },
        ];
      });
    },
    [],
  );
}

export async function getContactPage(): Promise<ContactPageCopy | null> {
  return withFallback(
    "getContactPage",
    async () => {
      const data = await fetchEntries<ContactPageFields>("contactPage", {
        limit: 1,
      });

      const entry = data.items[0];
      if (!entry) {
        console.warn("No contactPage entry published in Contentful.");
        return null;
      }

      // Every field except `intro` is required in the content model, so an entry
      // missing any of them cannot render a usable form. Treat that as no copy at
      // all rather than emitting blank labels.
      const f = entry.fields;
      const heading = requiredString(f.heading, "heading", entry.sys.id);
      const submitLabel = requiredString(
        f.submitLabel,
        "submitLabel",
        entry.sys.id,
      );
      const submittingLabel = requiredString(
        f.submittingLabel,
        "submittingLabel",
        entry.sys.id,
      );
      const successMessage = requiredString(
        f.successMessage,
        "successMessage",
        entry.sys.id,
      );
      const errorMessage = requiredString(
        f.errorMessage,
        "errorMessage",
        entry.sys.id,
      );

      if (
        !heading ||
        !submitLabel ||
        !submittingLabel ||
        !successMessage ||
        !errorMessage
      ) {
        return null;
      }

      return {
        heading,
        intro: optionalString(f.intro),
        submitLabel,
        submittingLabel,
        successMessage,
        errorMessage,
      };
    },
    null,
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return withFallback(
    `getPostBySlug(${slug})`,
    async () => {
      // Filtering server-side rather than fetching every post and finding one
      // keeps the request proportional to what is rendered.
      const data = await fetchEntries<BlogPostFields>("blogPost", {
        "fields.slug": slug,
        limit: 1,
      });

      const entry = data.items[0];
      if (!entry) return null;

      const f = entry.fields;
      const title = requiredString(f.title, "title", entry.sys.id);
      if (!title) return null;

      return {
        title,
        slug,
        author: optionalString(f.author),
        date: optionalString(f.date),
        excerpt: optionalString(f.excerpt),
        coverImage: resolveImage(f.coverImage, assets(data), title),
        body: f.body ?? null,
      };
    },
    null,
  );
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  return withFallback(
    `getTeamMember(${id})`,
    async () => {
      // Filtered server-side by entry id rather than fetching the whole team and
      // finding one, so the request stays proportional to what is rendered.
      const data = await fetchEntries<TeamMemberFields>("teamMember", {
        "sys.id": id,
        limit: 1,
      });

      const entry = data.items[0];
      if (!entry) return null;

      const f = entry.fields;
      const name = requiredString(f.name, "name", entry.sys.id);
      const designation = requiredString(
        f.designation,
        "designation",
        entry.sys.id,
      );
      if (!name || !designation) return null;

      return {
        id: entry.sys.id,
        name,
        designation,
        bio: optionalString(f.bio),
        photo: resolveImage(f.photo, assets(data), name),
      };
    },
    null,
  );
}

/**
 * Masthead copy for a single route, keyed by a readable entry id such as
 * `page-blog`. Returns null when the entry is absent so the caller can fall
 * back rather than render empty headings.
 */
export async function getPageContent(id: string): Promise<PageContent | null> {
  return withFallback(
    `getPageContent(${id})`,
    async () => {
      const data = await fetchEntries<PageContentFields>("pageContent", {
        "sys.id": id,
        limit: 1,
      });

      const entry = data.items[0];
      if (!entry) {
        console.warn(`No pageContent entry "${id}" published in Contentful.`);
        return null;
      }

      const f = entry.fields;
      return {
        eyebrow: optionalString(f.eyebrow),
        heading: optionalString(f.heading),
        intro: optionalString(f.intro),
        primaryCtaLabel: optionalString(f.primaryCtaLabel),
        secondaryCtaLabel: optionalString(f.secondaryCtaLabel),
        sectionOneHeading: optionalString(f.sectionOneHeading),
        sectionTwoHeading: optionalString(f.sectionTwoHeading),
      };
    },
    null,
  );
}
