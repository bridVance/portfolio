import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PANELS = [
  {
    href: "/lab",
    label: "Design",
    heading: "Interfaces worth looking at",
    line: "Shader work, custom WebGL, kinetic type — built to perform on a mid-range phone, not just a demo reel.",
    cta: "See the Lab",
  },
  {
    href: "/automation",
    label: "Automation",
    heading: "Systems that run the busywork",
    line: "Agents that talk to customers, book the appointment, chase the follow-up — on the WhatsApp, calendar and CRM a business already uses.",
    cta: "See automation",
  },
] as const;

/** The design ↔ automation split (§5.1): one panel per half of the studio. */
export function DesignAutomationSplit() {
  return (
    <section
      aria-labelledby="what-we-do"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="What we do" id="what-we-do">
        Two halves of one studio
      </SectionHeading>

      <div className="mt-10 grid divide-y divide-line border-y border-line md:grid-cols-2 md:divide-x md:divide-y-0">
        {PANELS.map((panel, i) => (
          <Reveal key={panel.href} delay={i * 0.08}>
            <Link
              href={panel.href}
              className="group flex h-full flex-col gap-3 p-8 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 md:p-12"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {panel.label}
              </span>
              <span className="text-xl font-medium md:text-2xl">{panel.heading}</span>
              <span className="max-w-[46ch] font-body text-muted">{panel.line}</span>
              <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-fg transition-colors group-hover:text-accent group-focus-visible:text-accent">
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
