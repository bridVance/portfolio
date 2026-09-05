import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SitePreview } from "./SitePreview";
import { FlowPreview } from "./FlowPreview";

const PANELS = [
  {
    href: "/lab",
    label: "Design",
    heading: "Interfaces worth looking at",
    forWhom: "For businesses that look like everyone else.",
    cta: "See it in motion",
    Visual: SitePreview,
  },
  {
    href: "/automation",
    label: "Automation",
    heading: "Systems that run the busywork",
    forWhom: "For teams answering the same questions all day.",
    cta: "See what they handle",
    Visual: FlowPreview,
  },
] as const;

/**
 * The design ↔ automation split (§5.1): one panel per half of the studio.
 * Each panel shows rather than tells — a miniature site browsing itself, and an
 * automation graph moving work through — because the audience is a business
 * owner, not an engineer. Both visuals are decorative CSS/SVG and cost nothing
 * in the bundle.
 */
export function DesignAutomationSplit() {
  return (
    <section
      aria-labelledby="what-we-do"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="What we do" id="what-we-do" index="01">
        Two halves of one studio
      </SectionHeading>

      <div className="mt-10 grid divide-y divide-line border-y border-line md:grid-cols-2 md:divide-x md:divide-y-0">
        {PANELS.map((panel, i) => (
          <Reveal key={panel.href} delay={i * 0.08}>
            <Link
              href={panel.href}
              className="group flex h-full flex-col p-8 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 md:p-12"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {panel.label}
              </span>
              <span className="mt-3 text-xl font-medium md:text-2xl">
                {panel.heading}
              </span>
              <span className="mt-2 max-w-[36ch] font-body text-muted">
                {panel.forWhom}
              </span>

              <div className="mt-6">
                <panel.Visual />
              </div>

              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-sm text-fg transition-colors group-hover:text-accent group-focus-visible:text-accent">
                {panel.cta}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
