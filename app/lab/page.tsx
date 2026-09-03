import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Interactive front-end experiments — shaders, 3D, glass, kinetic type.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <PageHeader
      eyebrow="Experiments"
      title="Lab"
      lede="Real, runnable demos of the techniques we use in production work."
    />
  );
}
