import { Reveal } from "@/components/ui/Reveal";

/** The studio's one-line claim (§5.1) — sets up the design ↔ automation split. */
export function Thesis() {
  return (
    <section
      aria-label="What BridVance does"
      className="mx-auto max-w-3xl px-4 py-24 md:py-32"
    >
      <Reveal>
        <p className="text-pretty text-2xl font-medium leading-snug text-fg md:text-4xl md:leading-tight">
          We design the surface people touch, and build the automation running
          behind it.
        </p>
      </Reveal>
    </section>
  );
}
