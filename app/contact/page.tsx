import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Start a project or request an automation sample.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageHeader
      eyebrow="Get in touch"
      title="Start a project"
      lede="Tell us what you're building. We reply within one business day."
    />
  );
}
