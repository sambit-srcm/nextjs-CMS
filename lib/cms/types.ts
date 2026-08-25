/* ---------- Raw field shapes, as the REST API returns them ---------- */

import type { AssetLink } from "./client";

export type SiteSettingsFields = {
  bannerTitle: string;
  bannerSubtitle: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
};

export type BlogPostFields = {
  title: string;
  slug: string;
  author: string;
  date: string;
  excerpt: string;
  coverImage: AssetLink;
  /**
   * Contentful RichText. Left as `unknown` deliberately: no route renders it
   * yet, so there is nothing to type it against. Whoever builds the article
   * page should add the renderer and type it properly then.
   */
  body: unknown;
};

export type ServiceFields = {
  title: string;
  description: string;
  price: string;
  image: AssetLink;
  order: number;
};

export type TeamMemberFields = {
  name: string;
  designation: string;
  bio: string;
  photo: AssetLink;
  order: number;
};

export type ContactPageFields = {
  heading: string;
  intro: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
};

/* ---------- Flat shapes the UI actually consumes ---------- */

export type CmsImage = {
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
  coverImage: CmsImage | null;
  body: unknown;
};

export type Service = {
  title: string;
  description: string;
  price: string;
  image: CmsImage | null;
};

export type TeamMember = {
  name: string;
  designation: string;
  bio: string;
  photo: CmsImage | null;
};

export type ContactPageCopy = {
  heading: string;
  intro: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
};
