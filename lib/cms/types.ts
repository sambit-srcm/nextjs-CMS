/* ---------- Raw field shapes, as the REST API returns them ---------- */

import type { Document } from "@contentful/rich-text-types";

import type { AssetLink } from "./client";

export type PageContentFields = {
  eyebrow: string;
  heading: string;
  intro: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  sectionOneHeading: string;
  sectionTwoHeading: string;
};

export type SiteSettingsFields = {
  logo: AssetLink;
  siteName: string;
  siteTagline: string;
  footerTagline: string;
  metaDescription: string;
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
  body: Document;
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

/** Masthead copy for one route. Every field is optional so a page still
 *  renders if an editor has not filled it in. */
export type PageContent = {
  eyebrow: string;
  heading: string;
  intro: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  sectionOneHeading: string;
  sectionTwoHeading: string;
};

export type SiteSettings = {
  /** Brand mark shown in the header. Null until an editor uploads one. */
  logo: CmsImage | null;
  siteName: string;
  siteTagline: string;
  footerTagline: string;
  metaDescription: string;
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
  body: Document | null;
};

export type Service = {
  title: string;
  description: string;
  price: string;
  image: CmsImage | null;
};

export type TeamMember = {
  /** The Contentful entry id, which is also the detail page segment. */
  id: string;
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
