/**
 * A fixed-window counter, held in memory.
 *
 * ponytail: process-local and fixed-window, not distributed or sliding. Two
 * ceilings follow from that, and both are deliberate:
 *
 *   - Serverless runs many instances and recycles them, so a caller spread
 *     across instances gets a fresh allowance on each, and a cold start clears
 *     every bucket. This raises the cost of flooding; it does not make it
 *     impossible.
 *   - A fixed window lets twice the limit through across a boundary — five at
 *     09:59 and five at 10:00. A sliding window closes that at the cost of
 *     keeping every timestamp.
 *
 * Both are the right trade for a contact form whose worst case is a wasted
 * email quota. The upgrade path is a shared store: UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are already scaffolded in .env.example, and its
 * REST API needs no dependency — swap the Map for two fetches and the callers
 * do not change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bounds memory if a flood arrives from many addresses: without this the Map
// grows once per distinct caller and nothing ever removes it.
const MAX_TRACKED = 10_000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Requests left in this window. */
  remaining: number;
  /** Seconds until the window resets. Zero while under the limit. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now: number = Date.now()
): RateLimitResult {
  if (buckets.size > MAX_TRACKED) prune(now);

  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/** Test seam: the Map is module state and would otherwise leak between cases. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * The caller's address, as the platform reports it.
 *
 * `x-vercel-forwarded-for` comes first because the edge sets it and a client
 * cannot forge it — `x-forwarded-for` is a client-supplied chain that only
 * means anything because a proxy rewrote it, and off Vercel nothing does. The
 * fallbacks keep this working in dev and let a test address a bucket of its
 * own; in production the first header is the one that answers.
 */
export function callerKey(headers: Headers): string {
  for (const header of ["x-vercel-forwarded-for", "x-forwarded-for", "x-real-ip"]) {
    // A forwarding chain lists proxies after the client, so only the first
    // entry is the caller.
    const value = headers.get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return "unknown";
}
