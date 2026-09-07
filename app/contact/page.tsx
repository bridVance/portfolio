import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Start a project, or ask for a sample agent built on your own content.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageHeader
      eyebrow="Get in touch"
      title="Start a project"
      lede="Tell us what you want handled. We reply within one business day, and we will say early if AI is not the right answer."
    />
  );
}
