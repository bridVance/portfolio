import { test, expect } from "@playwright/test";

test("dark tokens resolve on the un-stamped document", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  // #080B14
  expect(bg).toBe("rgb(8, 11, 20)");
});

test("explicit light theme beats OS dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  // #F6F7FA
  expect(bg).toBe("rgb(246, 247, 250)");
});
