import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Tools we build for ourselves and open up to everyone else — the studio's own AI products.",
  noindex: true,
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ours, not client work"
        title="Products"
        lede="Things we needed badly enough to build, then opened up. Early, opinionated, and shaped by running our own studio on them."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
        <Reveal>
          <EmptyState
            note="Our own products are still in private use — we run the studio on them before we ask anyone else to. Nothing here is ready to show honestly yet."
            actions={[
              { href: "/services", label: "See client work instead" },
            { href: "/contact", label: "Tell us what you need" },
            ]}
          />
        </Reveal>
      </section>
    </>
  );
}
