"use client";

import { useEffect, useState, type ReactNode } from "react";
import { dynamicEffect } from "@/components/effects/dynamicEffect";
import { cn } from "@/lib/cn";

const HeroShardIsland = dynamicEffect(
  () => import("@/components/effects/HeroShard"),
  {
    poster: { src: "/posters/hero-shard.svg", width: 640, height: 800, priority: true },
    minTier: "mid",
    rootMargin: "0px",
    className: "absolute inset-0",
  }
);

/**
 * Home hero: headline left, a faceted shard right with a pastel vertical
 * gradient (lilac → peach → sunlit yellow) and a warm bloom behind it that
 * lifts it off the near-white page. The R3F canvas is transparent, so the
 * bloom reads around and behind the shard; the whole section tracks the theme.
 *
 * The shard is a GPU effect-island: only "mid"/"high" devices load three.js and
 * render it live, and a post-mount FPS check drops back to the poster if it
 * runs slow. Everything else — low-tier GPUs, no-WebGL, save-data,
 * reduced-motion, SSR — gets the static poster below, which is the same visual
 * and never pulls three.js into the bundle.
 */
function Line({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={cn("bv-rise", className)}
      data-shown={shown || undefined}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-wash relative isolate overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-stretch md:min-h-[calc(100svh-3.5rem)] md:grid-cols-[1fr_minmax(0,44%)]">
        <div className="flex flex-col justify-center px-4 py-16 md:px-8 md:py-24">
          <Line delay={80}>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              BridVance
            </p>
          </Line>
          <Line delay={140}>
            <h1 className="mt-3 text-4xl font-medium md:text-6xl">
              Distinctive front-ends. Automation that actually runs.
            </h1>
          </Line>
          <Line delay={220}>
            <p className="mt-6 max-w-[52ch] font-body text-muted">
              A small studio building web experiences worth looking at, and
              agentic systems that handle the repetitive work behind them.
            </p>
          </Line>
        </div>

        <div className="relative min-h-[24rem] md:min-h-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255, 206, 148, 0.55), rgba(255, 206, 148, 0))",
            }}
          />
          <HeroShardIsland />
        </div>
      </div>
    </section>
  );
}
