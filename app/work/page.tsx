import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Work",
  description: "Selected BridVance projects — commerce, portals, and product front-ends.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageHeader
      eyebrow="Selected work"
      title="Work"
      lede="Six projects across commerce, B2B portals, and product UI. Full case studies are in progress."
    />
  );
}
