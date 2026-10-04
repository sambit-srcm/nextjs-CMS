import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

/** Built per environment so the sitemap URL is always absolute. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API routes aren't pages; keep crawlers off them.
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
