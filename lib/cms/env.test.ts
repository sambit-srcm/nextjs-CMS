import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("env", () => {
  it("reads the configured values", async () => {
    vi.resetModules();
    vi.stubEnv("CONTENTFUL_SPACE_ID", "space-123");
    vi.stubEnv("CONTENTFUL_DELIVERY_TOKEN", "token-abc");
    vi.stubEnv("CONTENTFUL_ENVIRONMENT", "staging");

    const env = await import("./env");
    expect(env.spaceId).toBe("space-123");
    expect(env.deliveryToken).toBe("token-abc");
    expect(env.environment).toBe("staging");
  });

  it("defaults the environment to master when unset", async () => {
    vi.resetModules();
    vi.stubEnv("CONTENTFUL_ENVIRONMENT", undefined);

    const env = await import("./env");
    expect(env.environment).toBe("master");
  });

  it.each(["CONTENTFUL_SPACE_ID", "CONTENTFUL_DELIVERY_TOKEN"])(
    "throws at import naming %s when it is missing",
    async (variable) => {
      vi.resetModules();
      vi.stubEnv(variable, "");

      // Validation happens at module load on purpose: a missing credential
      // should fail the build rather than surface later as an API error.
      await expect(import("./env")).rejects.toThrow(variable);
    },
  );
});
