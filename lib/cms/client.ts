import "server-only";

import { deliveryToken, environment, spaceId } from "./env";

const BASE = "https://cdn.contentful.com";

/** Options accepted by `fetchEntries`, mirroring the CDA query parameters. */
export type EntryQuery = Record<string, string | number | undefined>;

/** The part of a Contentful response the queries read. */
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

/** Loads entries from Contentful. `tags` let the webhook clear this cache. */
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
    // Contentful's error body explains more than the status code.
    const detail = await response.text();
    throw new Error(
      `Contentful responded ${response.status} for ${contentType}: ${detail}`,
    );
  }

  return response.json();
}
