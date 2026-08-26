import type { MetadataRoute } from "next";

import { getPosts, getTeam } from "@/lib/cms/queries";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 60;

/** Routes that exist regardless of what the CMS holds. */
const STATIC_PATHS = ["/", "/about", "/services", "/blog", "/contact"];

/**
 * Listed in robots.txt, so it has to exist — pointing a crawler at a missing
 * sitemap is worse than not naming one.
 *
 * Queries degrade to empty arrays when the CMS is unreachable, so an outage
 * yields a sitemap of the static routes rather than a failed build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, team] = await Promise.all([getPosts(), getTeam()]);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date ? new Date(post.date) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...team.map((member) => ({
      url: absoluteUrl(`/team/${member.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
