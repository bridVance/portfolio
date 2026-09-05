"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "@/components/ui/Mark";

const PRINCIPLES = [
  {
    title: "We start with what the business needs to happen.",
    body: "Before anything gets designed or automated, we work out what has to change — more enquiries answered, fewer hours lost, a site that finally looks like you.",
  },
  {
    title: "You see it running early, and often.",
    body: "Progress is a link you can open, not a status update. You get something working in front of you while there is still time to change your mind.",
  },
  {
    title: "We bring an opinion, you make the call.",
    body: "We will tell you what we think the right move is and why we think it. You decide — but you are not deciding on your own.",
  },
  {
    title: "It has to keep working without us.",
    body: "Documented, handed over, and yours. No lock-in, no black box only we understand, nothing that quietly breaks the month after we finish.",
  },
] as const;

/** The line, as a fraction of viewport height, where a card pins. */
const PIN = 0.32;

/**
 * "How we work" — a sticky label and rolling counter beside a deck of cards
 * that pin and stack as the section scrolls.
 *
 * The stacking is pure CSS: every card is `position: sticky` at the same
 * offset, so each one comes to rest on the last. The only JS is an
 * IntersectionObserver tracking which card is on top, feeding the counter and
 * a per-card `--bv-depth` that scales the buried cards back. That is a handful
 * of updates per section rather than per-frame work — deliberately, since the
 * page has to stay smooth on a cheap phone.
 */
export function HowWeWork() {
  const section = useRef<HTMLElement>(null);
  const marks = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = marks.current.filter(Boolean) as HTMLDivElement[];
    const root = section.current;
    if (!els.length || !root) return;

    let frame = 0;
    const recompute = () => {
      frame = 0;
      const line = window.innerHeight * PIN + 1;
      let idx = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(recompute);
    };
    const attach = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      recompute();
    };
    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    // An observer on the marks cannot drive this: pinning the band to the exact
    // line the cards stick at means margins summing to 100%, which collapses
    // the root box to zero height and never reports an intersection. So the
    // position is read on scroll instead, behind a rAF gate, and the observer's
    // only job is to keep that listener off whenever the deck is off screen.
    if (typeof IntersectionObserver === "undefined") {
      attach();
      return detach;
    }
    let listening = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === listening) return;
      listening = entry.isIntersecting;
      if (listening) attach();
      else detach();
    });
    io.observe(root);

    return () => {
      detach();
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={section}
      aria-labelledby="how-we-work"
      className="bv-stack mx-auto max-w-6xl px-4"
      style={{ ["--bv-cards" as string]: PRINCIPLES.length }}
    >
      <div className="bv-stack__runway">
        <div className="bv-stack__pin border-t border-line pt-6">
          {/* The running index sits beside the heading rather than inside it,
              so the h2's text stays "How we work" for the outline and tests. */}
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <Mark className="h-3.5 w-3.5 text-accent" />
            <span aria-hidden className="text-fg">
              02
              <span className="px-2 text-line">/</span>
            </span>
            <h2 id="how-we-work" className="font-mono text-xs font-normal uppercase tracking-[0.18em] text-muted">
              How we work
            </h2>
          </div>
          <p aria-hidden className="bv-odo mt-4 font-bold text-accent">
            <span>0</span>
            <span className="bv-odo__win">
              <span
                className="bv-odo__reel"
                style={{ ["--bv-i" as string]: active }}
              >
                {PRINCIPLES.map((p, i) => (
                  <span key={p.title}>{i + 1}</span>
                ))}
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* The cards must be siblings in one containing block: a per-card
          wrapper (an <li>, say) becomes the sticky containing block itself, so
          each card can only stick within its own card-height box — which is to
          say, not at all. The marks are absolutely positioned for the same
          reason, so they scroll with the deck without taking part in flow. */}
      <div className="bv-stack__deck">
        {PRINCIPLES.map((p, i) => (
          <div
            key={`mark-${p.title}`}
            ref={(el) => {
              marks.current[i] = el;
            }}
            aria-hidden
            className="bv-stack__mark"
            style={{ top: `calc(${i} * var(--bv-card-h))` }}
          />
        ))}
        {PRINCIPLES.map((p, i) => (
          <article
            key={p.title}
            className="bv-stack__card"
            style={{ ["--bv-depth" as string]: Math.max(0, active - i) }}
          >
            <p className="font-mono text-xs tabular-nums text-accent">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 max-w-[22ch] text-2xl font-medium leading-tight md:text-4xl">
              {p.title}
            </h3>
            <p className="mt-5 max-w-[42ch] font-body text-muted md:text-lg">
              {p.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
