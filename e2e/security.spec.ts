import { test, expect, type APIRequestContext } from "@playwright/test";
import { freshCaller } from "./support";

// The enquiry route is the only thing here that costs money to run: every
// accepted request spends from a 3,000/month email quota and can send a text.
// These are the controls in front of it, checked against the running server
// rather than argued for in a comment.

const VALID = { name: "Asha", email: "asha@example.com", message: "Hello" };

// Deliberately invalid. The limiter is applied before validation, so this is
// counted exactly like a real enquiry — and it stops at the 400 without
// spending an email. A suite that flooded the route with valid enquiries would
// send a hundred real messages to the studio inbox every full run.
const COUNTED_BUT_FREE = { name: "", email: "", message: "" };

/**
 * Compile the route before anything is counted.
 *
 * The counters live in module state, and `next dev` re-evaluates a route
 * module when it recompiles — which it does on the first request to it. A
 * counting loop that races that compile watches its own tally get wiped and
 * reads it as a limiter that does not work. Against `next start`, which is
 * what CI runs, this is a no-op.
 */
async function warmUp(request: APIRequestContext) {
  await request.post("/api/contact", { data: COUNTED_BUT_FREE, headers: freshCaller() });
}

test("a caller is cut off after the fifth enquiry in the window", async ({ request }) => {
  await warmUp(request);

  // One key for all six, so they land in the same bucket.
  const headers = freshCaller();

  for (let i = 1; i <= 5; i += 1) {
    const res = await request.post("/api/contact", { data: COUNTED_BUT_FREE, headers });
    // 400, not 429: the limiter counted it and validation refused it. That the
    // status is 400 is itself the check that counting happens first.
    expect(res.status(), `enquiry ${i} should be allowed through to validation`).toBe(400);
  }

  const refused = await request.post("/api/contact", { data: COUNTED_BUT_FREE, headers });
  expect(refused.status()).toBe(429);
  expect((await refused.json()).error).toBe("rate-limited");

  // Without Retry-After a client has no way to know when to come back, so it
  // comes back immediately — which is the thing the limit exists to stop.
  const retryAfter = Number(refused.headers()["retry-after"]);
  expect(retryAfter).toBeGreaterThan(0);
  expect(retryAfter).toBeLessThanOrEqual(600);
});

test("the limit is per caller, not global", async ({ request }) => {
  await warmUp(request);

  const exhausted = freshCaller();
  for (let i = 0; i < 6; i += 1) {
    await request.post("/api/contact", { data: COUNTED_BUT_FREE, headers: exhausted });
  }
  expect(
    (await request.post("/api/contact", { data: COUNTED_BUT_FREE, headers: exhausted })).status()
  ).toBe(429);

  const other = await request.post("/api/contact", {
    data: COUNTED_BUT_FREE,
    headers: freshCaller(),
  });
  expect(other.status()).toBe(400);
});

test("a cross-origin POST is refused", async ({ request }) => {
  const res = await request.post("/api/contact", {
    data: COUNTED_BUT_FREE,
    headers: { ...freshCaller(), origin: "https://not-this-site.example" },
  });
  expect(res.status()).toBe(403);
  expect((await res.json()).error).toBe("cross-origin");
});

test("a same-origin POST is not caught by that check", async ({ request, baseURL }) => {
  const res = await request.post("/api/contact", {
    data: COUNTED_BUT_FREE,
    headers: { ...freshCaller(), origin: baseURL! },
  });
  expect(res.status()).toBe(400);
});

test("a form-encoded POST is refused", async ({ request }) => {
  // The shape a cross-origin <form> can send. Requiring JSON is what makes
  // that request impossible without a preflight it would fail.
  const res = await request.post("/api/contact", {
    form: { name: "Asha", email: "asha@example.com", message: "Hello" },
    headers: freshCaller(),
  });
  expect(res.status()).toBe(415);
});

test("an oversized body is refused before it is parsed", async ({ request }) => {
  const res = await request.post("/api/contact", {
    data: { ...VALID, message: "x".repeat(20_000) },
    headers: freshCaller(),
  });
  expect(res.status()).toBe(413);
});

test("control characters in a name are rejected", async ({ request }) => {
  // A name reaches a mail Subject. A newline there starts a new header.
  const res = await request.post("/api/contact", {
    data: { ...VALID, name: "Asha\r\nBcc: someone@example.com" },
    headers: freshCaller(),
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).errors).toHaveProperty("name");
});

test("malformed JSON does not reach the field reads", async ({ request }) => {
  for (const data of ["null", '"hello"', "[1,2,3]", "{oops"]) {
    const res = await request.post("/api/contact", {
      data,
      headers: { ...freshCaller(), "content-type": "application/json" },
    });
    expect(res.status(), `body ${data}`).toBe(400);
  }
});

test("no enquiry response is cacheable", async ({ request }) => {
  const res = await request.post("/api/contact", {
    data: COUNTED_BUT_FREE,
    headers: freshCaller(),
  });
  expect(res.headers()["cache-control"]).toContain("no-store");
});

test("the security headers a scanner looks for are all present", async ({ request }) => {
  // The home page links a visitor to a securityheaders.com scan of this
  // origin, so the claim has to survive one.
  const headers = (await request.get("/")).headers();

  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("geolocation=()");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});
