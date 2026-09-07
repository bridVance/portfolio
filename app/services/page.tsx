import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI agents and assistants built for real businesses, and the interfaces people use them through.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <PageHeader
      eyebrow="What we build"
      title="Services"
      lede="Agents that answer, qualify and follow up; assistants that read your own documents; and the sites and interfaces people meet them through."
    />
  );
}
