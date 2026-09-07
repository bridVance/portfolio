import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = pageMetadata({
  title: "Work",
  description: "Selected BridVance projects — AI agents, automation, commerce and B2B portals.",
  noindex: true,
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Work"
        lede="Agents, automations and the products around them, across commerce and B2B. Full case studies are in progress."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
        <Reveal>
          <EmptyState
            note="Case studies are being written up — the work exists, the write-ups do not yet. The services page describes what we actually build, in the same detail a case study would."
            actions={[
              { href: "/services", label: "See what we build" },
            { href: "/contact", label: "Ask about similar work" },
            ]}
          />
        </Reveal>
      </section>
    </>
  );
}
