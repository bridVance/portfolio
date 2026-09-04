import { test, expect } from "@playwright/test";

test("one h1, then the section h2s in order", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const h2s = await page.locator("h2").allInnerTexts();
  expect(h2s).toEqual([
    "Two halves of one studio",
    "Non-negotiables",
    "Have something in mind?",
  ]);
});

test("the split panels navigate to /lab and /automation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /see the lab/i }).click();
  await expect(page).toHaveURL(/\/lab$/);
  await page.goBack();
  await page.getByRole("link", { name: /see automation/i }).click();
  await expect(page).toHaveURL(/\/automation$/);
});

test("the contact CTA navigates to /contact", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start a project/i }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("reduced-motion: no canvas, every section visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText(/we design the surface people touch/i)).toBeVisible();
  await expect(page.getByText(/two halves of one studio/i)).toBeVisible();
  await expect(page.getByText(/non-negotiables/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /start a project/i })).toBeVisible();
});

test("reduced-motion hero text is visible immediately on load", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /distinctive front-ends\. automation that actually runs\./i,
    })
  ).toBeVisible();
});
