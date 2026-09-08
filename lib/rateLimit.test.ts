import { callerKey, rateLimit, resetRateLimits } from "./rateLimit";

const WINDOW = { limit: 3, windowMs: 1000 };

beforeEach(resetRateLimits);

test("allows up to the limit, then refuses", () => {
  for (let i = 0; i < 3; i += 1) {
    expect(rateLimit("a", WINDOW, 0).ok).toBe(true);
  }
  expect(rateLimit("a", WINDOW, 0)).toMatchObject({ ok: false, retryAfter: 1 });
});

test("counts each caller separately", () => {
  for (let i = 0; i < 3; i += 1) rateLimit("a", WINDOW, 0);
  expect(rateLimit("b", WINDOW, 0).ok).toBe(true);
});

test("the window reopens at the boundary, not before", () => {
  for (let i = 0; i < 4; i += 1) rateLimit("a", WINDOW, 0);
  expect(rateLimit("a", WINDOW, 999).ok).toBe(false);
  expect(rateLimit("a", WINDOW, 1000).ok).toBe(true);
});

test("retryAfter counts down within the window and never rounds to zero", () => {
  for (let i = 0; i < 3; i += 1) rateLimit("a", WINDOW, 0);
  expect(rateLimit("a", WINDOW, 400).retryAfter).toBe(1);
  // 1ms left still has to be a whole second, or a client retries into a 429.
  expect(rateLimit("a", WINDOW, 999).retryAfter).toBe(1);
});

test("the edge header wins over the client-supplied chain", () => {
  const headers = new Headers({
    "x-vercel-forwarded-for": "203.0.113.7",
    "x-forwarded-for": "1.2.3.4",
  });
  expect(callerKey(headers)).toBe("203.0.113.7");
});

test("a forwarding chain resolves to the client, not a proxy", () => {
  expect(callerKey(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
    "203.0.113.7"
  );
});

test("an empty header falls through instead of becoming the key", () => {
  const headers = new Headers({ "x-forwarded-for": "", "x-real-ip": "203.0.113.9" });
  expect(callerKey(headers)).toBe("203.0.113.9");
  expect(callerKey(new Headers())).toBe("unknown");
});

test("the tracked-caller ceiling holds even when nothing has expired", () => {
  // The case the old prune missed: a flood inside one window leaves no expired
  // bucket to delete, so deleting expired buckets bounds nothing.
  const wide = { limit: 1, windowMs: 60_000 };
  for (let i = 0; i < 10_050; i += 1) rateLimit(`caller-${i}`, wide, 0);

  expect(rateLimit("one-more", wide, 0).ok).toBe(true);
  // Dropping everything is the accepted cost: each live caller gets one fresh
  // allowance, the same as a cold start.
  expect(rateLimit("caller-0", wide, 0).ok).toBe(true);
});

test("separate budgets do not share a bucket", () => {
  // The route runs a per-caller limit and a global one through the same store.
  const perCaller = { limit: 2, windowMs: 1000 };
  const global = { limit: 5, windowMs: 1000 };

  rateLimit("ip:1.2.3.4", perCaller, 0);
  rateLimit("ip:1.2.3.4", perCaller, 0);
  expect(rateLimit("ip:1.2.3.4", perCaller, 0).ok).toBe(false);
  expect(rateLimit("global", global, 0).ok).toBe(true);
});
