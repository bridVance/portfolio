"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { dynamicEffect } from "@/components/effects/dynamicEffect";
import { ParticleWord } from "./ParticleWord";
import { HeroStats } from "./HeroStats";
import { cn } from "@/lib/cn";

const HeroFlowIsland = dynamicEffect(
  () => import("@/components/effects/HeroFlow"),
  {
    poster: { src: "/posters/hero-flow.svg", width: 640, height: 800, priority: true },
    minTier: "mid",
    rootMargin: "0px",
    className: "absolute inset-0",
  }
);

/**
 * Home hero: headline left, a particle flow field right — tens of thousands of
 * points carried through a swirling vector field on the studio's sunset ramp,
 * over a warm bloom that lifts it off the near-white page. The R3F canvas is
 * transparent, so the bloom reads through the cloud; the whole section tracks
 * the theme, and the particles switch to additive blending on a dark ground.
 *
 * The field is a GPU effect-island: only "mid"/"high" devices load three.js and
 * render it live, and a post-mount FPS check drops back to the poster if it
 * runs slow. Everything else — low-tier GPUs, no-WebGL, save-data,
 * reduced-motion, SSR — gets the static poster below, which is a still of the
 * same cloud and never pulls three.js into the bundle.
 */
function Line({
  delay,
  className,
  variant = "rise",
  children,
}: {
  delay: number;
  className?: string;
  /** The headline wipes; everything around it rises. */
  variant?: "rise" | "wipe";
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={cn(variant === "wipe" ? "bv-wipe" : "bv-rise", className)}
      data-shown={shown || undefined}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Writes the pointer's offset from the section's centre onto the section as
 * two custom properties, which `.bv-par` layers read at different depths.
 * rAF-gated, so a burst of pointermove events costs one write per frame, and
 * skipped entirely on coarse pointers and under reduced motion.
 */
function usePointerDepth() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof matchMedia === "undefined") return;
    if (matchMedia("(pointer: coarse)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--bv-px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        el.style.setProperty("--bv-py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    };
    const reset = () => {
      el.style.setProperty("--bv-px", "0");
      el.style.setProperty("--bv-py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);
  return ref;
}

export function Hero() {
  const ref = usePointerDepth();
  return (
    <section
      ref={ref}
      className="hero-wash relative isolate -mt-[var(--bv-nav-h)] overflow-hidden pt-[var(--bv-nav-h)]"
    >
      <div className="mx-auto grid max-w-6xl items-stretch md:min-h-[calc(100svh-3.5rem)] md:grid-cols-[1fr_minmax(0,44%)]">
        <div
          className="bv-par flex flex-col justify-center px-4 py-16 md:px-8 md:py-24"
          style={{ "--bv-depth": -8 } as React.CSSProperties}
        >
          <Line delay={80}>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              BridVance &middot; AI agency
            </p>
          </Line>
          <Line delay={140} variant="wipe">
            <h1 className="mt-3 text-4xl font-medium md:text-6xl">
              <ParticleWord>AI agents</ParticleWord> that actually ship.
              Interfaces that make them usable.
            </h1>
          </Line>
          <Line delay={220}>
            <p className="mt-6 max-w-[52ch] font-body text-muted">
              An independent AI studio: agents and assistants that carry real
              work for real businesses, the interfaces people meet them
              through, and a few products of our own.
            </p>
          </Line>
          <Line delay={300}>
            <HeroStats />
          </Line>
        </div>

        <div
          className="bv-par relative min-h-[24rem] md:min-h-0"
          style={{ "--bv-depth": 18 } as React.CSSProperties}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255, 206, 148, 0.55), rgba(255, 206, 148, 0))",
            }}
          />
          <HeroFlowIsland />
        </div>
      </div>
    </section>
  );
}
