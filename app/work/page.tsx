import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Work",
  description: "Selected BridVance projects — AI agents, automation, commerce and B2B portals.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageHeader
      eyebrow="Selected work"
      title="Work"
      lede="Agents, automations and the products around them, across commerce and B2B. Full case studies are in progress."
    />
  );
}
