import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Spec §9: "axe has no serious violations" on every route. We gate on both
// `serious` and `critical`; `moderate` / `minor` are reported but non-blocking
// for the shell (revisit as content lands).
const ROUTES = ["/", "/work", "/lab", "/automation", "/contact"];

for (const path of ROUTES) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }) => {
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
