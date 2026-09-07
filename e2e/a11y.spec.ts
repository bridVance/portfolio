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
const ROUTES = ["/", "/work", "/services", "/products", "/lab", "/contact"];

// Both schemes, because the palettes are independent rather than one derived
// from the other: --surface is lighter than --surface-2 in light and darker in
// dark, so a colour pairing that passes in one can fail in the other. A
// light-only sweep is how a 1.10:1 diagram layer and a 3.67:1 citation reached
// production — axe's colour-contrast rule scores serious and would have caught
// both, but it was never pointed at the dark palette.
const SCHEMES = ["light", "dark"] as const;

for (const colorScheme of SCHEMES) {
  for (const path of ROUTES) {
    test(`${path} has no serious or critical accessibility violations (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();

      const blocking = violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      const summary = blocking
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]\n` +
            v.nodes
              .slice(0, 4)
              .map((n) => `      ${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`)
              .join("\n")
        )
        .join("\n");

      expect(
        blocking,
        `serious/critical axe violations on ${path} (${colorScheme}):\n${summary}`
      ).toEqual([]);
    });
  }
}
