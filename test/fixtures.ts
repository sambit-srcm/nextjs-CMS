import type { Document } from "@contentful/rich-text-types";

import type {
  BlogPost,
  ContactPageCopy,
  PageContent,
  Service,
  SiteSettings,
  TeamMember,
} from "@/lib/cms/types";

/*
 * Fully-populated CMS shapes. Tests override only the field under test, so a
 * new required field is added in one place rather than in every page test.
 */

export const aPageContent = (over: Partial<PageContent> = {}): PageContent => ({
  eyebrow: "Eyebrow copy",
  heading: "Heading copy",
  intro: "Intro copy",
  primaryCtaLabel: "Read reviews",
  secondaryCtaLabel: "About us",
  sectionOneHeading: "Section one",
  sectionTwoHeading: "Section two",
  ...over,
});

export const aSiteSettings = (
  over: Partial<SiteSettings> = {},
): SiteSettings => ({
  logo: { url: "https://images.test/logo.jpg", alt: "" },
  siteName: "Circuit",
  siteTagline: "Phones & Tech",
  footerTagline: "Independent phone reviews.",
  metaDescription: "Reviews across Android and iOS.",
  bannerTitle: "Banner title",
  bannerSubtitle: "Banner subtitle",
  missionTitle: "Our mission",
  missionBody: "Mission body.",
  visionTitle: "Our vision",
  visionBody: "Vision body.",
  ...over,
});

export const aPost = (over: Partial<BlogPost> = {}): BlogPost => ({
  title: "Pixel 10 Pro review",
  slug: "pixel-10-pro-review",
  author: "Ananya Prasad",
  date: "2026-02-14",
  excerpt: "A week with Google's flagship.",
  coverImage: { url: "https://images.test/pixel.jpg", alt: "Pixel 10 Pro" },
  body: null,
  ...over,
});

export const aService = (over: Partial<Service> = {}): Service => ({
  title: "Sponsored Reviews",
  description: "Long-form unboxings.",
  price: "From $2,500",
  image: { url: "https://images.test/reviews.jpg", alt: "Reviews" },
  ...over,
});

export const aMember = (over: Partial<TeamMember> = {}): TeamMember => ({
  id: "ananya-prasad",
  name: "Ananya Prasad",
  designation: "Senior Reviews Editor",
  bio: "Covers Android flagships.",
  photo: { url: "https://images.test/ananya.jpg", alt: "Ananya Prasad" },
  ...over,
});

export const aContactPage = (
  over: Partial<ContactPageCopy> = {},
): ContactPageCopy => ({
  heading: "Get in touch",
  intro: "Pitch a device or ask about partnerships.",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successMessage: "Thanks — we'll be in touch.",
  errorMessage: "Something went wrong. Try again.",
  ...over,
});

/** Exercises every mark and block the article route maps to typography. */
export const aRichTextBody = (): Document =>
  ({
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          { nodeType: "text", value: "Plain text. ", marks: [], data: {} },
          {
            nodeType: "text",
            value: "Bold text",
            marks: [{ type: "bold" }],
            data: {},
          },
          {
            nodeType: "text",
            value: "inline()",
            marks: [{ type: "code" }],
            data: {},
          },
        ],
      },
      {
        nodeType: "heading-2",
        data: {},
        content: [{ nodeType: "text", value: "Display", marks: [], data: {} }],
      },
      {
        nodeType: "heading-3",
        data: {},
        content: [{ nodeType: "text", value: "Battery", marks: [], data: {} }],
      },
      {
        nodeType: "unordered-list",
        data: {},
        content: [
          {
            nodeType: "list-item",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                data: {},
                content: [
                  {
                    nodeType: "text",
                    value: "Bright panel",
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        nodeType: "blockquote",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [
              {
                nodeType: "text",
                value: "Best in class.",
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
    ],
  }) as unknown as Document;
