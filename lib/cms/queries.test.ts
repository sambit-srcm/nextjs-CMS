import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getServices, getSiteSettings } from "./queries";

function respond(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

const collection = (items: unknown[], includes?: unknown) => ({
  total: items.length,
  items,
  ...(includes ? { includes } : {}),
});

const service = (fields: Record<string, unknown>, id = "e1") => ({
  sys: { id },
  fields,
});

beforeEach(() => {
  // Credentials come from test/setup.ts, which runs before module load.
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("getServices", () => {
  it("maps entries to the flat shape the UI consumes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection([
            service({ title: "Strategy", description: "Roadmaps.", price: "$1" }),
          ]),
        ),
      ),
    );

    await expect(getServices()).resolves.toEqual([
      { title: "Strategy", description: "Roadmaps.", price: "$1", image: null },
    ]);
  });

  it("skips entries missing a required field rather than rendering undefined", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection([
            service({ title: "Good", description: "Present." }, "ok"),
            service({ description: "No title." }, "bad"),
          ]),
        ),
      ),
    );

    const services = await getServices();
    expect(services).toHaveLength(1);
    expect(services[0].title).toBe("Good");
  });

  it("resolves a linked asset from the includes block", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection(
            [
              service({
                title: "Strategy",
                description: "d",
                image: { sys: { id: "asset-1" } },
              }),
            ],
            {
              Asset: [
                {
                  sys: { id: "asset-1" },
                  fields: {
                    description: "Alt text",
                    file: {
                      url: "//images.ctfassets.net/x.png",
                      details: { image: { width: 10, height: 20 } },
                    },
                  },
                },
              ],
            },
          ),
        ),
      ),
    );

    const [result] = await getServices();
    // Contentful returns protocol-relative URLs; they must be usable as-is.
    expect(result.image).toEqual({
      url: "https://images.ctfassets.net/x.png",
      alt: "Alt text",
      width: 10,
      height: 20,
    });
  });

  it("yields null for a link with no matching asset, rather than throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection([
            service({
              title: "Strategy",
              description: "d",
              image: { sys: { id: "missing" } },
            }),
          ]),
        ),
      ),
    );

    const [result] = await getServices();
    expect(result.image).toBeNull();
  });

  it("degrades to an empty list when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(getServices()).resolves.toEqual([]);
  });

  it("degrades to an empty list on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ message: "boom" }, false)));
    await expect(getServices()).resolves.toEqual([]);
  });
});

describe("getSiteSettings", () => {
  it("returns null when no entry is published", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getSiteSettings()).resolves.toBeNull();
  });

  it("returns null when the request fails, so the page can omit the section", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(getSiteSettings()).resolves.toBeNull();
  });
});
