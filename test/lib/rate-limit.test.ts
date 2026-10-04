import { describe, expect, it } from "vitest";

import { clientIp, createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit inside the window, then blocks", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });

    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 100).allowed).toBe(true);
    expect(limiter.check("a", 200)).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
  });

  it("allows again once the oldest request leaves the window", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    limiter.check("a", 0);
    expect(limiter.check("a", 500).allowed).toBe(false);
    expect(limiter.check("a", 1000).allowed).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    limiter.check("a", 0);
    expect(limiter.check("b", 0).allowed).toBe(true);
  });

  it("forgets expired keys once it tracks many senders", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10 });

    for (let i = 0; i < 5_001; i++) limiter.check(`ip-${i}`, 0);
    // all of those have expired by t=100, so ip-0 is fresh again
    expect(limiter.check("ip-0", 100).allowed).toBe(true);
  });

  it("can be reset", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    limiter.check("a", 0);
    limiter.reset();
    expect(limiter.check("a", 1).allowed).toBe(true);
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost", { headers });

  it("uses the first x-forwarded-for address", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to x-real-ip, then to a shared bucket", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(req({}))).toBe("unknown");
  });
});
