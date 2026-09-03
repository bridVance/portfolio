import { test, expect } from "@playwright/test";

test("font CSS variables are defined on <html>", async ({ page }) => {
  await page.goto("/");
  const vars = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      display: s.getPropertyValue("--font-display").trim(),
      body: s.getPropertyValue("--font-body").trim(),
      mono: s.getPropertyValue("--font-mono").trim(),
    };
  });
  expect(vars.display).toContain("Familjen");
  expect(vars.body).toContain("Newsreader");
  expect(vars.mono).toContain("JetBrains");
});
