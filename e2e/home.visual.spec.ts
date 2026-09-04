import { test, expect } from "@playwright/test";

test.skip(!process.env.VISUAL, "opt-in layout regression net — run `npm run e2e:visual`");
test.skip(({ browserName }) => browserName !== "chromium", "baselines are chromium-only");

// A layout-regression net for `/`. It pins the page's declared *static* state —
// the same one `prefers-reduced-motion` users get — so the baseline is stable
// across runs and machines:
//   - GPU tier resolves to "low" (lib/gpu.ts reads the reduced-motion query),
//     so the hero paints its <Poster> and never the live R3F canvas.
//   - <Reveal> renders its plain, fully-visible branch — no scroll-reveal. This
//     matters: `toHaveScreenshot({ fullPage })` captures beyond the viewport
//     WITHOUT scrolling, so the below-the-fold reveals' IntersectionObservers
//     never fire and half the page would otherwise shoot blank.
//   - the hero headline choreography and nav-glass ramp resolve to final state.
//
// `reducedMotion` is pinned via a `matchMedia` shim in `beforeEach` (below)
// rather than Playwright's context option, because `toHaveScreenshot`'s
// animation handling re-emulates media mid-capture: a context-level
// `reducedMotion` gets overridden during the shot, the app's
// `matchMedia("change")` listener fires, and every Reveal re-hides. The shim
// makes the app immune to that.
test.use({ colorScheme: "light" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Pin `(prefers-reduced-motion: reduce)` -> matches, with inert listeners,
    // so nothing can flip the page back to full-motion during the screenshot.
    // Every other media query passes through untouched.
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      if (query.includes("prefers-reduced-motion")) {
        return {
          matches: query.includes("reduce"),
          media: query,
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent() {
            return false;
          },
        } as unknown as MediaQueryList;
      }
      return real(query);
    };
    // Belt-and-braces: keep the hero effect latched to its poster.
    try {
      sessionStorage.setItem("bv-fx-downgraded:/posters/hero-shard.svg", "1");
    } catch {}
  });
});

for (const width of [1280, 390] as const) {
  test(`home layout @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`home-${width}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
