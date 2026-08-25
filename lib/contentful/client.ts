import "server-only";

import { deliveryToken, environment, spaceId } from "./env";

const BASE = "https://cdn.contentful.com";

/** Options accepted by `fetchEntries`, mirroring the CDA query parameters. */
export type EntryQuery = Record<string, string | number | undefined>;

/**
 * The subset of a Content Delivery API collection response the queries use.
 *
 * Linked assets are not inlined by the REST API; they arrive alongside the
 * entries in `includes.Asset` and are matched back by ID at the mapping
 * boundary.
 */
export type EntryCollection<Fields> = {
  total: number;
  items: { sys: { id: string }; fields: Partial<Fields> }[];
  includes?: { Asset?: RawAsset[] };
};

export type RawAsset = {
  sys: { id: string };
  fields?: {
    title?: string;
    description?: string;
    file?: {
      url?: string;
      details?: { image?: { width?: number; height?: number } };
    };
  };
};

/** A link to an asset, as it appears on an entry field before resolution. */
export type AssetLink = { sys: { id: string; linkType?: string } };

/**
 * Reads a collection from the Content Delivery API.
 *
 * Uses `fetch` directly rather than an SDK so that Next's cache sees the
 * request: `revalidate` and `tags` below are what make on-demand revalidation
 * possible, which an axios-based client cannot offer.
 */
export async function fetchEntries<Fields>(
  contentType: string,
  query: EntryQuery = {},
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<EntryCollection<Fields>> {
  const params = new URLSearchParams({ content_type: contentType });

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }

  const url = `${BASE}/spaces/${spaceId}/environments/${environment}/entries?${params}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${deliveryToken}` },
    next: {
      revalidate: options.revalidate ?? 60,
      tags: options.tags ?? [contentType],
    },
  });

  if (!response.ok) {
    // Read the body for the reason — Contentful returns a JSON error envelope
    // that is far more useful than the status code alone.
    const detail = await response.text();
    throw new Error(
      `Contentful responded ${response.status} for ${contentType}: ${detail}`,
    );
  }

  return response.json();
}
