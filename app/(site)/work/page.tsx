import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { DemoFrame } from "@/components/work/DemoFrame";
import { DEMOS } from "@/lib/demos";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Case studies you can scroll: complete demo sites built to show what the studio makes, embedded and running.",
  path: "/work",
});

export default function WorkPage() {
  const ready = DEMOS.filter((d) => d.ready).length;
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Work"
        lede="Not screenshots. Each of these is a complete site running in the page — scroll it, click through it, add something to a cart. Client names are withheld where the work was commissioned."
      />

      <section
        aria-labelledby="case-studies"
        className="mx-auto max-w-6xl px-4 pb-20 md:pb-28"
      >
        <h2 id="case-studies" className="sr-only">
          Case studies
        </h2>
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {ready} of {DEMOS.length} live
        </p>
        <div className="flex flex-col gap-8">
          {DEMOS.map((demo, i) => (
            <Reveal key={demo.slug} delay={i * 0.04}>
              <DemoFrame demo={demo} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
