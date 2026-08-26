import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getContactPage,
  getPageContent,
  getPostBySlug,
  getPosts,
  getServices,
  getSiteSettings,
  getTeam,
  getTeamMember,
} from "./queries";

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

  it("leaves an already-absolute asset URL untouched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection(
            [service({ title: "T", description: "d", image: { sys: { id: "a" } } })],
            {
              Asset: [
                {
                  sys: { id: "a" },
                  fields: { file: { url: "https://cdn.example.com/x.png" } },
                },
              ],
            },
          ),
        ),
      ),
    );

    const [result] = await getServices();
    expect(result.image?.url).toBe("https://cdn.example.com/x.png");
  });

  it("falls back to the entry title for alt text when the asset has none", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection(
            [service({ title: "Strategy", description: "d", image: { sys: { id: "a" } } })],
            { Asset: [{ sys: { id: "a" }, fields: { file: { url: "//x/y.png" } } }] },
          ),
        ),
      ),
    );

    const [result] = await getServices();
    expect(result.image?.alt).toBe("Strategy");
  });

  it("yields null when the matched asset has no file at all", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection(
            [service({ title: "T", description: "d", image: { sys: { id: "a" } } })],
            { Asset: [{ sys: { id: "a" }, fields: {} }] },
          ),
        ),
      ),
    );

    const [result] = await getServices();
    expect(result.image).toBeNull();
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
  it("maps every field, including the brand strings the layout needs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection([
            service(
              {
                bannerTitle: "Circuit",
                bannerSubtitle: "Phone reviews.",
                siteName: "Circuit",
                siteTagline: "Phones & Tech",
                footerTagline: "Independent reviews.",
                metaDescription: "Reviews and launches.",
                missionTitle: "What we cover",
                missionBody: "Android and iOS.",
                visionTitle: "How we review",
                visionBody: "Two weeks minimum.",
              },
              "site-settings",
            ),
          ]),
        ),
      ),
    );

    await expect(getSiteSettings()).resolves.toEqual({
      siteName: "Circuit",
      siteTagline: "Phones & Tech",
      footerTagline: "Independent reviews.",
      metaDescription: "Reviews and launches.",
      bannerTitle: "Circuit",
      bannerSubtitle: "Phone reviews.",
      missionTitle: "What we cover",
      missionBody: "Android and iOS.",
      visionTitle: "How we review",
      visionBody: "Two weeks minimum.",
    });
  });

  it("returns null when the banner title is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(collection([service({ bannerSubtitle: "No title." }, "site-settings")])),
      ),
    );
    await expect(getSiteSettings()).resolves.toBeNull();
  });

  it("returns null when no entry is published", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getSiteSettings()).resolves.toBeNull();
  });

  it("returns null when the request fails, so the page can omit the section", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(getSiteSettings()).resolves.toBeNull();
  });
});

describe("getPosts", () => {
  it("maps entries and requests newest first", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respond(
        collection([
          service(
            {
              title: "Pixel 10 Pro review",
              slug: "pixel-10-pro-review",
              author: "Ananya Prasad",
              date: "2026-08-19",
              excerpt: "The camera carries it.",
            },
            "p1",
          ),
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const [post] = await getPosts();
    expect(post).toMatchObject({
      title: "Pixel 10 Pro review",
      slug: "pixel-10-pro-review",
      author: "Ananya Prasad",
      coverImage: null,
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("order=-fields.date");
  });

  it("passes a limit through to the request when given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(collection([])));
    vi.stubGlobal("fetch", fetchMock);

    await getPosts(3);
    expect(String(fetchMock.mock.calls[0][0])).toContain("limit=3");
  });

  it("omits the limit entirely when not given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(collection([])));
    vi.stubGlobal("fetch", fetchMock);

    await getPosts();
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("limit=");
  });

  it("skips a post with no slug, since nothing could link to it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(collection([service({ title: "No slug" }, "bad")])),
      ),
    );
    await expect(getPosts()).resolves.toEqual([]);
  });

  it("degrades to an empty list on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(getPosts()).resolves.toEqual([]);
  });
});

describe("getTeam", () => {
  it("exposes the entry id, which the detail route is keyed on", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respond(
          collection([
            service({ name: "Ananya Prasad", designation: "Editor", bio: "Bio." }, "ananya-prasad"),
          ]),
        ),
      ),
    );

    const [member] = await getTeam();
    expect(member).toMatchObject({ id: "ananya-prasad", name: "Ananya Prasad" });
  });

  it("skips a member missing a designation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond(collection([service({ name: "Nameless" }, "x")]))),
    );
    await expect(getTeam()).resolves.toEqual([]);
  });

  it("degrades to an empty list on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(getTeam()).resolves.toEqual([]);
  });
});

describe("getPostBySlug", () => {
  it("filters server-side rather than fetching everything", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respond(collection([service({ title: "T", slug: "s", excerpt: "e" }, "p1")])),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getPostBySlug("pixel-10-pro-review");
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("fields.slug=pixel-10-pro-review");
    expect(url).toContain("limit=1");
  });

  it("returns null when nothing matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getPostBySlug("nope")).resolves.toBeNull();
  });

  it("returns null on failure rather than throwing into the page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(getPostBySlug("x")).resolves.toBeNull();
  });
});

describe("getTeamMember", () => {
  it("looks the member up by entry id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respond(
        collection([service({ name: "Marcus Feld", designation: "Reviewer", bio: "b" }, "marcus-feld")]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const member = await getTeamMember("marcus-feld");
    expect(member).toMatchObject({ id: "marcus-feld", name: "Marcus Feld" });
    expect(String(fetchMock.mock.calls[0][0])).toContain("sys.id=marcus-feld");
  });

  it("returns null for an unknown id", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getTeamMember("nobody")).resolves.toBeNull();
  });

  it("returns null when a required field is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond(collection([service({ name: "Only a name" }, "x")]))),
    );
    await expect(getTeamMember("x")).resolves.toBeNull();
  });
});

describe("getContactPage", () => {
  const complete = {
    heading: "Send us a tip",
    submitLabel: "Send",
    submittingLabel: "Sending",
    successMessage: "Thanks",
    errorMessage: "Failed",
  };

  it("returns the copy when every required field is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond(collection([service(complete, "contact-page")]))),
    );
    await expect(getContactPage()).resolves.toMatchObject(complete);
  });

  it.each(["heading", "submitLabel", "submittingLabel", "successMessage", "errorMessage"])(
    "returns null when %s is missing, rather than a blank label",
    async (field) => {
      const fields = { ...complete } as Record<string, string>;
      delete fields[field];
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(collection([service(fields, "contact-page")]))),
      );
      await expect(getContactPage()).resolves.toBeNull();
    },
  );

  it("returns null when no entry is published", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getContactPage()).resolves.toBeNull();
  });
});

describe("getPageContent", () => {
  it("returns masthead copy for the requested page id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      respond(
        collection([service({ eyebrow: "About", heading: "Who writes this" }, "page-about")]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const copy = await getPageContent("page-about");
    expect(copy).toMatchObject({ eyebrow: "About", heading: "Who writes this" });
    expect(String(fetchMock.mock.calls[0][0])).toContain("sys.id=page-about");
  });

  it("fills absent optional fields with empty strings", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond(collection([service({ heading: "Only a heading" }, "p")]))),
    );

    const copy = await getPageContent("p");
    expect(copy).toEqual({
      eyebrow: "",
      heading: "Only a heading",
      intro: "",
      primaryCtaLabel: "",
      secondaryCtaLabel: "",
      sectionOneHeading: "",
      sectionTwoHeading: "",
    });
  });

  it("returns null when the entry is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(collection([]))));
    await expect(getPageContent("page-missing")).resolves.toBeNull();
  });
});
