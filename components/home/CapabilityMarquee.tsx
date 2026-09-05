const ITEMS = [
  "Custom websites",
  "Design systems",
  "3D & motion",
  "WhatsApp agents",
  "Online booking",
  "Automated follow-ups",
  "CRM integration",
  "Accessibility",
  "Speed on real phones",
] as const;

function Track() {
  return (
    <ul className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          <span className="whitespace-nowrap px-5 font-mono text-xs uppercase tracking-[0.18em] text-muted md:px-7 md:text-sm">
            {item}
          </span>
          <span className="text-[0.45rem] text-accent">&#9670;</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Capability ticker under the hero: the studio's range drifting past in one
 * line, plainly named — a business owner reads "Online booking", not "WebGL".
 *
 * The track holds the list twice and `.bv-marquee` slides it exactly half its
 * width, so the loop is seamless; hover or keyboard focus anywhere in the strip
 * pauses it, and reduced motion leaves it parked. The moving copy is
 * `aria-hidden` (it would otherwise be announced twice) with one readable list
 * behind it for assistive tech.
 */
export function CapabilityMarquee() {
  return (
    <section
      aria-label="What we work on"
      className="bv-marquee-wrap relative overflow-hidden border-y border-line py-4"
    >
      <div className="bv-marquee" aria-hidden>
        <Track />
        <Track />
      </div>

      <p className="sr-only">{ITEMS.join(", ")}.</p>

      {/* Soft edges so items enter and leave rather than snapping at the frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg to-transparent md:w-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg to-transparent md:w-24"
      />
    </section>
  );
}
