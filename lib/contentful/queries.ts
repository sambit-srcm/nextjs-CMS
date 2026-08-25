import "server-only";

import type { Asset, UnresolvedLink } from "contentful";

import { client } from "./client";
import { withFallback } from "./errors";
import type {
  BlogPost,
  BlogPostSkeleton,
  ContactPageCopy,
  ContactPageSkeleton,
  ContentfulImage,
  Service,
  ServiceSkeleton,
  SiteSettings,
  SiteSettingsSkeleton,
  TeamMember,
  TeamMemberSkeleton,
} from "./types";
import { optionalString, requiredString } from "./validate";

/** Contentful asset URLs come back protocol-relative (`//images.ctfassets.net/…`). */
function toImage(
  asset: Asset<"WITHOUT_UNRESOLVABLE_LINKS"> | UnresolvedLink<"Asset"> | undefined,
  fallbackAlt: string,
): ContentfulImage | null {
  if (!asset || !("fields" in asset) || !asset.fields.file) return null;

  const { file, title, description } = asset.fields;
  const url = typeof file.url === "string" ? file.url : null;
  if (!url) return null;

  const dimensions = file.details?.image;

  return {
    url: url.startsWith("//") ? `https:${url}` : url,
    alt: (description || title || fallbackAlt) as string,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return withFallback("getSiteSettings", async () => {
    const { items } =
      await client.withoutUnresolvableLinks.getEntries<SiteSettingsSkeleton>({
        content_type: "siteSettings",
        limit: 1,
      });

    const entry = items[0];
    if (!entry) {
      console.warn("No siteSettings entry published in Contentful.");
      return null;
    }

    const f = entry.fields;
    const bannerTitle = requiredString(f.bannerTitle, "bannerTitle", entry.sys.id);
    if (!bannerTitle) return null;

    return {
      bannerTitle,
      bannerSubtitle: optionalString(f.bannerSubtitle),
      missionTitle: optionalString(f.missionTitle),
      missionBody: optionalString(f.missionBody),
      visionTitle: optionalString(f.visionTitle),
      visionBody: optionalString(f.visionBody),
    };
  }, null);
}

export async function getPosts(limit?: number): Promise<BlogPost[]> {
  return withFallback("getPosts", async () => {
    const { items } =
      await client.withoutUnresolvableLinks.getEntries<BlogPostSkeleton>({
        content_type: "blogPost",
        order: ["-fields.date"],
        ...(limit ? { limit } : {}),
      });

    return items.flatMap((entry) => {
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
          coverImage: toImage(f.coverImage, title),
          body: f.body ?? null,
        },
      ];
    });
  }, []);
}

export async function getServices(): Promise<Service[]> {
  return withFallback("getServices", async () => {
    const { items } =
      await client.withoutUnresolvableLinks.getEntries<ServiceSkeleton>({
        content_type: "service",
        order: ["fields.order"],
      });

    return items.flatMap((entry) => {
      const f = entry.fields;
      const title = requiredString(f.title, "title", entry.sys.id);
      const description = requiredString(f.description, "description", entry.sys.id);
      if (!title || !description) return [];

      return [
        {
          title,
          description,
          price: optionalString(f.price),
          image: toImage(f.image, title),
        },
      ];
    });
  }, []);
}

export async function getTeam(): Promise<TeamMember[]> {
  return withFallback("getTeam", async () => {
    const { items } =
      await client.withoutUnresolvableLinks.getEntries<TeamMemberSkeleton>({
        content_type: "teamMember",
        order: ["fields.order"],
      });

    return items.flatMap((entry) => {
      const f = entry.fields;
      const name = requiredString(f.name, "name", entry.sys.id);
      const designation = requiredString(f.designation, "designation", entry.sys.id);
      if (!name || !designation) return [];

      return [
        {
          name,
          designation,
          bio: optionalString(f.bio),
          photo: toImage(f.photo, name),
        },
      ];
    });
  }, []);
}

export async function getContactPage(): Promise<ContactPageCopy | null> {
  return withFallback("getContactPage", async () => {
    const { items } =
      await client.withoutUnresolvableLinks.getEntries<ContactPageSkeleton>({
        content_type: "contactPage",
        limit: 1,
      });

    const entry = items[0];
    if (!entry) {
      console.warn("No contactPage entry published in Contentful.");
      return null;
    }

    // Every field except `intro` is required in the content model, so an
    // entry missing any of them cannot render a usable form. Treat that as
    // no copy at all rather than emitting blank labels.
    const f = entry.fields;
    const heading = requiredString(f.heading, "heading", entry.sys.id);
    const submitLabel = requiredString(f.submitLabel, "submitLabel", entry.sys.id);
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
  }, null);
}
