import "server-only";

import type { Asset, UnresolvedLink } from "contentful";

import { client } from "./client";
import type {
  BlogPost,
  BlogPostSkeleton,
  ContentfulImage,
  Service,
  ServiceSkeleton,
  SiteSettings,
  SiteSettingsSkeleton,
  TeamMember,
  TeamMemberSkeleton,
} from "./types";

/** Contentful asset URLs come back protocol-relative (`//images.ctfassets.net/…`). */
function toImage(
  asset: Asset<"WITHOUT_UNRESOLVABLE_LINKS"> | UnresolvedLink<"Asset"> | undefined,
  fallbackAlt: string,
): ContentfulImage | null {
  if (!asset || !("fields" in asset) || !asset.fields.file) return null;

  const { file, title, description } = asset.fields;
  const dimensions = file.details?.image;

  return {
    url: file.url.startsWith("//") ? `https:${file.url}` : String(file.url),
    alt: (description || title || fallbackAlt) as string,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { items } = await client.withoutUnresolvableLinks.getEntries<SiteSettingsSkeleton>(
    { content_type: "siteSettings", limit: 1 },
  );

  const entry = items[0];
  if (!entry) return null;

  const f = entry.fields;
  return {
    bannerTitle: f.bannerTitle ?? "",
    bannerSubtitle: f.bannerSubtitle ?? "",
    missionTitle: f.missionTitle ?? "",
    missionBody: f.missionBody ?? "",
    visionTitle: f.visionTitle ?? "",
    visionBody: f.visionBody ?? "",
  };
}

export async function getPosts(limit?: number): Promise<BlogPost[]> {
  const { items } = await client.withoutUnresolvableLinks.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.date"],
    ...(limit ? { limit } : {}),
  });

  return items.map((entry) => {
    const f = entry.fields;
    return {
      title: f.title ?? "",
      slug: f.slug ?? "",
      author: f.author ?? "",
      date: f.date ?? "",
      excerpt: f.excerpt ?? "",
      coverImage: toImage(f.coverImage, f.title ?? ""),
      body: f.body ?? null,
    };
  });
}

export async function getServices(): Promise<Service[]> {
  const { items } = await client.withoutUnresolvableLinks.getEntries<ServiceSkeleton>({
    content_type: "service",
    order: ["fields.order"],
  });

  return items.map((entry) => {
    const f = entry.fields;
    return {
      title: f.title ?? "",
      description: f.description ?? "",
      price: f.price ?? "",
      image: toImage(f.image, f.title ?? ""),
    };
  });
}

export async function getTeam(): Promise<TeamMember[]> {
  const { items } = await client.withoutUnresolvableLinks.getEntries<TeamMemberSkeleton>({
    content_type: "teamMember",
    order: ["fields.order"],
  });

  return items.map((entry) => {
    const f = entry.fields;
    return {
      name: f.name ?? "",
      designation: f.designation ?? "",
      bio: f.bio ?? "",
      photo: toImage(f.photo, f.name ?? ""),
    };
  });
}
