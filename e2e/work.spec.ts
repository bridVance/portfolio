import { test, expect } from "@playwright/test";

// The case studies are embedded as same-origin iframes. Asserting the frames
// *exist* is not enough: the site's own security headers once refused every
// frame — `frame-ancestors 'none'` plus `X-Frame-Options: DENY` block
// same-origin embedding too — and /work shipped showing six "refused to
// connect" panels while every other check stayed green. These assert the demo
// actually renders inside the frame.

test("the first case study loads inside its frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");

  // The frames are loading="lazy", so on a small viewport the first one is
  // still below the fold when the page settles.
  await page.locator('iframe[title*="Vegan sauce brand"]').scrollIntoViewIfNeeded();
  const frame = page.frameLocator('iframe[title*="Vegan sauce brand"]');
  await expect(frame.getByRole("heading", { level: 1 })).toContainText(
    /plants can carry/i
  );
});

test("framing is allowed from this origin and refused from others", async ({
  request,
}) => {
  const res = await request.get("/demo/sauce");
  const csp = res.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'self'");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
});

test("every demo route renders its own document", async ({ page }) => {
  for (const slug of [
    "sauce",
    "dates",
    "distributor",
    "clinic",
    "restaurant",
    "watches",
  ]) {
    const res = await page.goto(`/demo/${slug}`);
    expect(res?.status(), `/demo/${slug}`).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    // A demo must never be mistaken for the studio site around it.
    await expect(page.locator("header nav[aria-label='Primary']")).toHaveCount(0);
  }
});
