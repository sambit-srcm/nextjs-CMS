import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

/**
 * Generated rather than served as a static file in `public/`, so the sitemap
 * URL is absolute and correct per environment instead of hardcoded to one
 * host. Next serves the result at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Route handlers, not pages: nothing here belongs in an index, and the
      // revalidation endpoint should not be probed by crawlers.
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
