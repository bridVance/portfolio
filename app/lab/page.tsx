import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Runnable experiments — agent demos, shaders, 3D and kinetic type.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <PageHeader
      eyebrow="Experiments"
      title="Lab"
      lede="Demos you can actually poke at — agents to talk to, and the interface techniques we use in production."
    />
  );
}
