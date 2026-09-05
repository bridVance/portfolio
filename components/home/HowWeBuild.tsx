import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
      <SectionHeading label="How we build" id="how-we-build" index="02">
        Non-negotiables
      </SectionHeading>

      {/* explicit role="list": Tailwind preflight's list-style:none strips the
          implicit list role in Safari/VoiceOver — restoring it is intentional. */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul role="list" className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {PILLARS.map((pillar, i) => (
          <li key={pillar.term}>
            <Reveal delay={i * 0.06}>
              <div aria-hidden className="bv-rule h-px w-full bg-line" />
              <div className="flex gap-4 pt-5">
                <span
                  aria-hidden
                  className="font-mono text-xs tabular-nums text-accent"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
                    {pillar.term}
                  </p>
                  <p className="mt-1 font-body text-muted">{pillar.line}</p>
                </div>
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
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </section>
  );
}
