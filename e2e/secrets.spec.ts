import { test, expect } from "@playwright/test";
import { freshCaller } from "./support";

// The studio phone number must never reach a browser.
//
// It is server-only by construction — no NEXT_PUBLIC_ prefix, read in one
// route handler — but "by construction" is an argument, not a check. A stray
// NEXT_PUBLIC_, a number pasted into a component, or a debug value echoed from
// an API route would all defeat it silently. This looks at what actually ships.

const ROUTES = ["/", "/work", "/services", "/products", "/lab", "/contact"];

// Phone-shaped, not merely ten digits: minified bundles are full of incidental
// digit runs and a looser pattern flagged the polyfill chunk. This wants an
// explicit +91, which is what a real number on a page looks like. The exact
// configured number is checked separately and does not rely on this.
const INDIAN_MOBILE = /\+\s?91[\s-]?\d{5}[\s-]?\d{5}|\+\s?91[\s-]?\d{10}/;

// Provider keys are the other secret that must never ship. Resend keys are
// `re_` plus a long token; the same mistake that would expose a phone number —
// a NEXT_PUBLIC_ prefix, a value pasted into a component — exposes these too,
// and this one is far more costly.
const PROVIDER_KEY = /re_[A-Za-z0-9]{6,}_[A-Za-z0-9]{20,}|SK[a-f0-9]{32}/;

test("no phone number reaches the browser on any route", async ({ page, request }) => {
  const configured = process.env.CONTACT_PHONE?.replace(/\D/g, "");
  const seenScripts = new Set<string>();

  for (const route of ROUTES) {
    const res = await page.goto(route);
    const html = (await res?.text()) ?? "";

    expect(html, `${route} HTML contains a phone number`).not.toMatch(INDIAN_MOBILE);
    expect(html, `${route} HTML contains a provider key`).not.toMatch(PROVIDER_KEY);
    if (configured) {
      expect(html.replace(/\D/g, ""), `${route} HTML contains the studio number`)
        .not.toContain(configured);
    }

    for (const src of await page.locator("script[src]").evaluateAll((els) =>
      els.map((e) => (e as HTMLScriptElement).src)
    )) {
      if (src.startsWith("http")) seenScripts.add(src);
    }
  }

  expect(seenScripts.size, "expected client bundles to scan").toBeGreaterThan(0);

  for (const src of seenScripts) {
    const body = await (await request.get(src)).text();
    expect(body, `${src} contains a phone number`).not.toMatch(INDIAN_MOBILE);
    expect(body, `${src} contains a provider key`).not.toMatch(PROVIDER_KEY);
    if (configured) {
      expect(body.replace(/\D/g, ""), `${src} contains the studio number`)
        .not.toContain(configured);
    }
  }
});

test("the contact API never echoes the number back", async ({ request }) => {
  const configured = process.env.CONTACT_PHONE?.replace(/\D/g, "");

  for (const payload of [
    { name: "", email: "bad", message: "" },
    // Trips the honeypot, so it takes the success path's response without
    // spending an email. Any of these bodies would do; what is being checked
    // is that none of them come back carrying the number.
    { name: "Asha", email: "asha@example.com", message: "Hello", company: "bot" },
  ]) {
    const res = await request.post("/api/contact", {
      data: payload,
      headers: freshCaller(),
    });
    const body = await res.text();
    expect(body).not.toMatch(INDIAN_MOBILE);
    if (configured) expect(body.replace(/\D/g, "")).not.toContain(configured);
  }
});

test("every enquiry is addressed to the studio inbox", async ({ page, request }, testInfo) => {
  // The destination is a constant with an env override. A typo in either would
  // send enquiries somewhere nobody reads, and nothing else would notice.
  //
  // This is the one request in the suite that really sends when a provider key
  // is configured, so it runs on a single project rather than all five — the
  // studio inbox is read for actual leads, and five test enquiries a run is a
  // cost the other four projects add nothing for. The name says what it is.
  const live = testInfo.project.name === "chromium-desktop";
  const res = await request.post("/api/contact", {
    data: live
      ? { name: "Playwright suite", email: "suite@example.com", message: "Automated check." }
      : { name: "Asha", email: "asha@example.com", message: "Hello", company: "bot" },
    headers: freshCaller(),
  });
  const body = await res.json();

  // Unconfigured, the route must name the inbox rather than fail silently.
  if (res.status() === 503) {
    expect(body.error).toBe("not-configured");
    expect(body.email).toBe("bridvance@gmail.com");
  } else {
    expect(res.ok()).toBe(true);
  }

  // The fallback is forced rather than waited for: once a provider key is
  // configured the route succeeds, and a test that only passes while delivery
  // is broken is worse than no test.
  await page.route("**/api/contact", (r) =>
    r.fulfill({ status: 502, contentType: "application/json", body: "{}" })
  );

  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Asha Menon");
  await page.getByLabel("Email").fill("asha@example.com");
  await page.getByLabel(/what do you want handled/i).fill("Forty enquiries a day.");
  await page.getByRole("button", { name: /send enquiry/i }).click();

  const fallback = page.getByRole("link", { name: /send it from your mail app/i });
  await expect(fallback).toBeVisible();
  const href = (await fallback.getAttribute("href")) ?? "";
  expect(href).toContain("mailto:bridvance@gmail.com");
  expect(decodeURIComponent(href)).toContain("Forty enquiries a day.");
  expect(decodeURIComponent(href)).toContain("asha@example.com");
});
