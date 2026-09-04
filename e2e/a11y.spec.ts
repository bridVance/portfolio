import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Spec §9: "axe has no serious violations" on every route. We gate on both
// `serious` and `critical`; `moderate` / `minor` are reported but non-blocking
// for the shell (revisit as content lands).
//
// Reduced-motion is emulated so <Reveal> renders its content at full opacity —
// otherwise axe either mis-blends a mid-fade element (false serious) or skips
// a settled `opacity:0` element (coverage hole). The `aria-hidden` hero canvas
// is not axe-scanned under reduced motion, which is acceptable (LHCI runs a
// full-motion a11y audit).
const ROUTES = ["/", "/work", "/lab", "/automation", "/contact"];

for (const path of ROUTES) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();

    const blocking = violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    const summary = blocking
      .map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`)
      .join("\n");

    expect(blocking, `serious/critical axe violations on ${path}:\n${summary}`).toEqual([]);
  });
}
