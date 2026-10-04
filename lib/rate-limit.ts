/** Counts requests in memory. Each server keeps its own count. */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  /** How many requests one key may make inside the window. */
  limit: number;
  /** Length of the window in milliseconds. */
  windowMs: number;
}) {
  // For each key: how many requests so far, and when the count starts again.
  const counters = new Map<string, { count: number; resetAt: number }>();

  return {
    /** Records a request; `allowed` is false once over the limit. */
    check(key: string, now = Date.now()) {
      let counter = counters.get(key);

      // First request, or the last window is over: start a new window.
      if (!counter || now >= counter.resetAt) {
        counter = { count: 0, resetAt: now + windowMs };
        counters.set(key, counter);
      }

      if (counter.count >= limit) {
        const retryAfterSeconds = Math.ceil((counter.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds };
      }

      counter.count++;

      // Keep memory small: forget keys whose window is over.
      if (counters.size > 5_000) {
        for (const [k, c] of counters) {
          if (now >= c.resetAt) counters.delete(k);
        }
      }

      return { allowed: true, retryAfterSeconds: 0 };
    },

    /** Forget everything (used between tests). */
    reset() {
      counters.clear();
    },
  };
}

/** 5 contact messages per sender per 10 minutes. */
export const contactRateLimit = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
});

/** First IP in x-forwarded-for, which Vercel sets and the client cannot fake. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
