import type { Document } from "@contentful/rich-text-types";
import type { EntryFieldTypes, EntrySkeletonType } from "contentful";

/* ---------- Contentful entry skeletons (shape of the raw API response) ---------- */

export type SiteSettingsSkeleton = EntrySkeletonType<
  {
    bannerTitle: EntryFieldTypes.Symbol;
    bannerSubtitle: EntryFieldTypes.Text;
    missionTitle: EntryFieldTypes.Symbol;
    missionBody: EntryFieldTypes.Text;
    visionTitle: EntryFieldTypes.Symbol;
    visionBody: EntryFieldTypes.Text;
  },
  "siteSettings"
>;

export type BlogPostSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    author: EntryFieldTypes.Symbol;
    date: EntryFieldTypes.Date;
    excerpt: EntryFieldTypes.Text;
    coverImage: EntryFieldTypes.AssetLink;
    body: EntryFieldTypes.RichText;
  },
  "blogPost"
>;

export type ServiceSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    description: EntryFieldTypes.Text;
    price: EntryFieldTypes.Symbol;
    image: EntryFieldTypes.AssetLink;
    order: EntryFieldTypes.Integer;
  },
  "service"
>;

export type TeamMemberSkeleton = EntrySkeletonType<
  {
    name: EntryFieldTypes.Symbol;
    designation: EntryFieldTypes.Symbol;
    bio: EntryFieldTypes.Text;
    photo: EntryFieldTypes.AssetLink;
    order: EntryFieldTypes.Integer;
  },
  "teamMember"
>;

/* ---------- Flat shapes the UI actually consumes ---------- */

export type ContentfulImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type SiteSettings = {
  bannerTitle: string;
  bannerSubtitle: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  author: string;
  date: string;
  excerpt: string;
  coverImage: ContentfulImage | null;
  body: Document | null;
};

export type Service = {
  title: string;
  description: string;
  price: string;
  image: ContentfulImage | null;
};

export type TeamMember = {
  name: string;
  designation: string;
  bio: string;
  photo: ContentfulImage | null;
};
