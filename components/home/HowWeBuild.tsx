import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Mark } from "@/components/ui/Mark";

const PILLARS = [
  { term: "Craft", line: "Distinctive design, not templates." },
  {
    term: "Performance",
    line: "Fast on a mid-range phone, not just a desktop demo.",
  },
  {
    term: "Accessible",
    line: "Keyboard, contrast, reduced-motion as a baseline.",
  },
  {
    term: "Secure",
    line: "Hardened headers, validated inputs, dependency hygiene, no data we don't need.",
  },
] as const;

// TODO(lhci-report-url): set to the permanent Lighthouse report URL once the
// LHCI upload target is stable; until then the link is not rendered.
const LIGHTHOUSE_URL = "";
const HEADERS_SCAN_URL =
  "https://securityheaders.com/?q=https%3A%2F%2Fbridvance.vercel.app&followRedirects=on";

/** The four-pillar "how we build" band (§10.4) — positioning that is verifiable. */
export function HowWeBuild() {
  return (
    <section
      aria-labelledby="how-we-build"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="How we build" id="how-we-build">
        Non-negotiables
      </SectionHeading>

      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {PILLARS.map((pillar, i) => (
          <li key={pillar.term}>
            <Reveal delay={i * 0.06} className="flex gap-3">
              <Mark className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
                  {pillar.term}
                </p>
                <p className="mt-1 font-body text-muted">{pillar.line}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
        {LIGHTHOUSE_URL ? (
          <a
            href={LIGHTHOUSE_URL}
            target="_blank"
            rel="noopener"
            className="hover:text-fg"
          >
            Lighthouse report &#8599;
          </a>
        ) : null}
        <a
          href={HEADERS_SCAN_URL}
          target="_blank"
          rel="noopener"
          className="hover:text-fg"
        >
          Security headers scan &#8599;
        </a>
      </p>
    </section>
  );
}
