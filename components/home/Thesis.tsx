"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * See `.bv-giant` / `.bv-label` in globals.css. Size and leading are
 * deliberately kept out of utility classes — tailwind-merge drops a `leading-*`
 * that precedes a `text-[…]` font size, which silently reverts these to the
 * body's 1.6.
 */
const KIND = {
  label: "bv-label font-mono font-medium text-muted",
  solid: "bv-giant uppercase",
  bare: "bv-giant bv-giant--bare uppercase",
  outline: "bv-giant bv-outline uppercase",
  italic: "bv-giant bv-giant--italic",
} as const;

type Slot = { text: string; kind: keyof typeof KIND };

/**
 * Three bands of "Independent design & automation studio, built with craft."
 * Each pins one word hard left and one hard right so the composition spans the
 * full measure, as the reference does.
 *
 * Design, automation and studio are giants on cream blocks; the connectives
 * stay small. Design and automation carry equal weight — one solid, one italic
 * — and the line resolves on a quality rather than a service, so neither half
 * of the studio reads as the whole of it.
 *
 * `drift` is the band's horizontal parallax in pixels, alternating direction.
 */
const BANDS: ReadonlyArray<{
  drift: number;
  slots: readonly [Slot, Slot];
}> = [
  {
    drift: -80,
    slots: [
      { text: "Independent", kind: "label" },
      { text: "Design", kind: "solid" },
    ],
  },
  {
    drift: 100,
    slots: [
      { text: "& Automation", kind: "italic" },
      { text: "Studio", kind: "bare" },
    ],
  },
  {
    drift: -60,
    slots: [
      { text: "Built with", kind: "label" },
      { text: "Craft", kind: "outline" },
    ],
  },
];

/**
 * The studio's claim (§5.1) set as a display composition rather than prose:
 * "Independent design & automation studio, built with craft."
 *
 * The words themselves never move. The only motion is each band drifting
 * sideways as the section crosses the viewport, in alternating directions, so
 * the three slide past each other rather than as a block.
 *
 * The drift writes a single custom property per frame straight to the DOM —
 * never React state — behind a rAF gate, and the listener is only attached
 * while the section is on screen (hence the observer, which tracks
 * `isIntersecting` rather than latching). It is off entirely under reduced
 * motion and below 700px, where the bands stack with no room to travel.
 */
export function Thesis() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shown || reduceMotion) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const half = window.innerHeight / 2;
      const centre = rect.top + rect.height / 2;
      // -1 below the fold, 0 dead centre, +1 above it.
      const p = Math.max(-1, Math.min(1, (half - centre) / half));
      el.style.setProperty("--bv-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [shown, reduceMotion]);

  return (
    <section
      aria-label="What BridVance does"
      className="overflow-hidden px-[22px] py-20 md:px-14 md:py-[18vh]"
    >
      <div ref={ref} className="bv-stage">
        {/* The words are block-level, so their text nodes would run together
            ("IndependentDesign&Automation…") for assistive tech and crawlers.
            The sentence is given once, punctuated; the rest is decorative. */}
        <p className="sr-only">
          Independent design &amp; automation studio, built with craft.
        </p>

        <div aria-hidden>
          {BANDS.map((band) => (
            <div
              key={band.drift}
              className="bv-band flex flex-col items-start gap-y-2 md:flex-row md:items-center md:justify-between md:gap-x-6 md:gap-y-0"
              style={{ "--bv-drift": `${band.drift}px` } as CSSProperties}
            >
              {band.slots.map((slot) => (
                <span
                  key={slot.text}
                  className={cn("bv-word", KIND[slot.kind])}
                >
                  {slot.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
