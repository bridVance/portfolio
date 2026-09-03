import { test, expect, type Page } from "@playwright/test";

// Below the `md` breakpoint (mobile-chrome / mobile-safari) the primary nav
// collapses behind a "Menu" toggle. Reveal it so its controls are actionable;
// on desktop the toggle is display:none so this is a no-op.
async function revealPrimaryNav(page: Page) {
  const menu = page.getByRole("button", { name: /^menu$/i });
  if (await menu.isVisible().catch(() => false)) await menu.click();
}

const primaryNav = (page: Page) =>
  page.getByRole("navigation", { name: "Primary" });

test("theme toggle cycles and persists", async ({ page }) => {
  await page.goto("/");
  await revealPrimaryNav(page);
  await primaryNav(page).getByRole("button", { name: /theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("skip link is reachable and targets #main", async ({ page, browserName }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /skip to content/i });

  await page.keyboard.press("Tab");
  const reachedByTab = await link.evaluate((el) => el === document.activeElement);

  // Chromium & Firefox always tab-focus links, so the skip link — the first
  // focusable node in the document — MUST be what Tab lands on. Assert that, so
  // the tab-order guarantee stays real and a future focusable inserted ahead of
  // it fails the test. WebKit only tab-focuses links with the OS "Full Keyboard
  // Access" setting on, so there we fall back to programmatic focus (the link is
  // a plain <a href> with no negative tabindex — in tab order by spec).
  if (browserName === "webkit") {
    if (!reachedByTab) await link.focus();
  } else {
    expect(reachedByTab).toBe(true);
  }

  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute("href", "#main");
  // sr-only until focused, then revealed on-screen (focus:not-sr-only + fixed).
  await expect(link).toBeInViewport();

  // Activating it must move keyboard focus into <main> (tabIndex={-1}), not just
  // scroll — otherwise the next Tab resumes from the top of the document.
  await link.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("reduced-motion emulation renders no <canvas>", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("primary nav is fully keyboard operable", async ({ page }) => {
  await page.goto("/");
  await revealPrimaryNav(page);
  await primaryNav(page).getByRole("link", { name: "Work" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work$/);
});
