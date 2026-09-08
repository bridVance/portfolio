import { test, expect } from "@playwright/test";

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

test("no phone number reaches the browser on any route", async ({ page, request }) => {
  const configured = process.env.CONTACT_PHONE?.replace(/\D/g, "");
  const seenScripts = new Set<string>();

  for (const route of ROUTES) {
    const res = await page.goto(route);
    const html = (await res?.text()) ?? "";

    expect(html, `${route} HTML contains a phone number`).not.toMatch(INDIAN_MOBILE);
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
    { name: "Asha", email: "asha@example.com", message: "Hello" },
  ]) {
    const res = await request.post("/api/contact", { data: payload });
    const body = await res.text();
    expect(body).not.toMatch(INDIAN_MOBILE);
    if (configured) expect(body.replace(/\D/g, "")).not.toContain(configured);
  }
});
