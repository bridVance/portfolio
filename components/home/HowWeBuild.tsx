import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PILLARS = [
  { term: "Craft", line: "Distinctive design, not templates." },
  {
    term: "Evaluated",
    line: "Agents are measured against real cases before they go live, not judged on a demo that went well.",
  },
  {
    term: "Grounded",
    line: "Answers come from your content, with a source you can check — not from a model's memory.",
  },
  {
    term: "Private",
    line: "Your data stays yours. Not used for training, and no processor we cannot name.",
  },
  {
    term: "Performance",
    line: "Fast on a mid-range phone, not just a desktop demo.",
  },
  {
    term: "Accessible",
    line: "Keyboard, contrast, reduced-motion as a baseline.",
  },
] as const;

// TODO(lhci-report-url): set to the permanent Lighthouse report URL once the
// LHCI upload target is stable; until then the link is not rendered.
const LIGHTHOUSE_URL = "";
const HEADERS_SCAN_URL =
  "https://securityheaders.com/?q=https%3A%2F%2Fbridvance.vercel.app&followRedirects=on";

/** The "how we build" band (§10.4) — positioning a client can actually check. */
export function HowWeBuild() {
  return (
    <section
      aria-labelledby="how-we-build"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="How we build" id="how-we-build" index="03">
        Non-negotiables
      </SectionHeading>

      {/* explicit role="list": Tailwind preflight's list-style:none strips the
          implicit list role in Safari/VoiceOver — restoring it is intentional. */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul role="list" className="mt-10 grid gap-5 md:grid-cols-2">
        {PILLARS.map((pillar, i) => (
          <li key={pillar.term}>
            {/* Same card as the service offerings (/services): a claim a client
                can check is a thing in its own right, not a line under a rule.
                h-full so "Craft" — one short sentence — does not leave its
                neighbour hanging below it. */}
            <Reveal delay={i * 0.06} className="h-full">
              <div className="bv-card flex h-full gap-4 rounded-xl border border-line bg-surface p-5 md:p-6">
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
