import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Automation",
  description: "Agentic systems for clinics, real estate, and more — request a sample for your business.",
  path: "/automation",
});

export default function AutomationPage() {
  return (
    <PageHeader
      eyebrow="Agentic systems"
      title="Automation"
      lede="Systems that run one repetitive workflow end to end, plugged into the tools you already use."
    />
  );
}
