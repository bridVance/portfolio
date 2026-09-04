import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/** Closing call to action (§5.1). The button is the page's one solid `--accent`. */
export function ContactBand() {
  return (
    <section
      aria-labelledby="contact-band"
      className="border-t border-line bg-surface"
    >
      <Reveal className="mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <h2 id="contact-band" className="text-2xl font-medium md:text-4xl">
          Have something in mind?
        </h2>
        <p className="mx-auto mt-4 max-w-[48ch] font-body text-muted">
          Tell us what you&rsquo;re building &mdash; front-end, automation, or both.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-colors hover:bg-accent-strong focus-visible:bg-accent-strong"
        >
          Start a project
        </Link>
      </Reveal>
    </section>
  );
}
