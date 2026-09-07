import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Runnable experiments — agent demos, shaders, 3D and kinetic type.",
  noindex: true,
  path: "/lab",
});

export default function LabPage() {
  return (
    <>
      <PageHeader
        eyebrow="Experiments"
        title="Lab"
        lede="Demos you can actually poke at — agents to talk to, and the interface techniques we use in production."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
        <Reveal>
          <EmptyState
            note="Experiments are being moved out of local branches and into something you can poke at. The home page already runs several of the techniques the lab will document."
            actions={[
              { href: "/", label: "See them running" },
            { href: "/contact", label: "Start a project" },
            ]}
          />
        </Reveal>
      </section>
    </>
  );
}
