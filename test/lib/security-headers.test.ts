import { describe, expect, it } from "vitest";

import {
  contentSecurityPolicy,
  currentEnvironment,
  securityHeaders,
} from "@/lib/security-headers";

const production = { isDev: false, isVercelPreview: false, isVercel: true };

const directive = (policy: string, name: string) =>
  policy
    .split("; ")
    .find((d) => d.startsWith(`${name} `))
    ?.slice(name.length + 1);

describe("contentSecurityPolicy", () => {
  it("only allows scripts from this site in production", () => {
    const policy = contentSecurityPolicy(production);

    expect(directive(policy, "script-src")).toBe("'self' 'unsafe-inline'");
    expect(directive(policy, "frame-ancestors")).toBe("'none'");
    expect(directive(policy, "object-src")).toBe("'none'");
    expect(directive(policy, "connect-src")).toBe("'self'");
    expect(directive(policy, "img-src")).toContain(
      "https://images.ctfassets.net",
    );
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toContain("vercel.live");
  });

  it("allows eval and websockets in development only", () => {
    const policy = contentSecurityPolicy({
      isDev: true,
      isVercelPreview: false,
      isVercel: false,
    });

    expect(directive(policy, "script-src")).toContain("'unsafe-eval'");
    expect(directive(policy, "connect-src")).toBe("'self' ws: wss:");
    // plain-HTTP localhost would break if assets were forced to https://
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("lets the Vercel Toolbar load on preview deployments", () => {
    const policy = contentSecurityPolicy({
      isDev: false,
      isVercelPreview: true,
      isVercel: true,
    });

    expect(directive(policy, "script-src")).toContain("https://vercel.live");
    expect(directive(policy, "frame-src")).toBe("https://vercel.live");
    expect(directive(policy, "connect-src")).toContain(
      "wss://ws-us3.pusher.com",
    );
  });
});

describe("securityHeaders", () => {
  it("sends the full set of security headers", () => {
    const names = securityHeaders(production).map((h) => h.key);

    expect(names).toEqual([
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
    ]);
  });
});

describe("currentEnvironment", () => {
  it("reads the Vercel and Node environment variables", () => {
    const saved = { ...process.env };
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "preview";

    expect(currentEnvironment()).toMatchObject({
      isVercel: true,
      isVercelPreview: true,
    });

    process.env = saved;
  });
});
