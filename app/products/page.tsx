import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Tools we build for ourselves and open up to everyone else — the studio's own AI products.",
  noindex: true,
  path: "/products",
});

export default function ProductsPage() {
  return (
    <PageHeader
      eyebrow="Ours, not client work"
      title="Products"
      lede="Things we needed badly enough to build, then opened up. Early, opinionated, and shaped by running our own studio on them."
    />
  );
}
