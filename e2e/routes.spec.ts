import { test, expect } from "@playwright/test";

const ROUTES = [
  // Home <h1> is the shipped headline ("AI agents that actually ship. ..."), not the
  // brand word; keep /bridvance/i as an accepted alt, mirroring how /contact/
  // is paired with /start a project/ below for the same h1-vs-title reason.
  { path: "/", h1: /ai agents|bridvance/i, title: /BridVance/ },
  { path: "/work", h1: /work/i, title: /Work — BridVance/ },
  { path: "/lab", h1: /lab/i, title: /Lab — BridVance/ },
  { path: "/services", h1: /services/i, title: /Services — BridVance/ },
  { path: "/products", h1: /products/i, title: /Products — BridVance/ },
  { path: "/contact", h1: /contact|start a project/i, title: /Contact — BridVance/ },
];

for (const r of ROUTES) {
  test(`${r.path} renders one main, one h1 and a title`, async ({ page }) => {
    await page.goto(r.path);
    await expect(page).toHaveTitle(r.title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(r.h1);
  });
}

test("sitemap lists the routes with content, and only those", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  // A route that is still only a PageHeader stays in the nav but out of the
  // sitemap — see ROUTES `thin`. Submitting four near-empty pages for indexing
  // is a thin-content signal, not coverage.
  for (const p of ["/services", "/contact"]) expect(xml).toContain(p);
  expect(xml).toContain("<loc>");
  for (const p of ["/work", "/products", "/lab"]) expect(xml).not.toContain(p);
});

test("thin routes are marked noindex", async ({ page }) => {
  for (const p of ["/work", "/products", "/lab"]) {
    await page.goto(p);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
  }
});

test("no horizontal scroll at 320px on every route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const r of ROUTES) {
    await page.goto(r.path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow, `${r.path} overflows at 320px`).toBe(false);
  }
});
