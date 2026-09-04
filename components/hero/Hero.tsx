"use client";

import { dynamicEffect } from "@/components/effects/dynamicEffect";

const HeroShardIsland = dynamicEffect(
  () => import("@/components/effects/HeroShard"),
  {
    poster: { src: "/posters/hero-shard.svg", width: 640, height: 800 },
    minTier: "mid",
    rootMargin: "0px",
    className: "absolute inset-0",
  }
);

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-stretch md:min-h-[calc(100svh-3.5rem)] md:grid-cols-[1fr_minmax(0,44%)]">
      <div className="flex flex-col justify-center px-4 py-16 md:px-8 md:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          BridVance
        </p>
        <h1 className="mt-3 text-4xl font-medium md:text-6xl">
          Distinctive front-ends. Automation that actually runs.
        </h1>
        <p className="mt-6 max-w-[52ch] font-body text-muted">
          A small studio building web experiences worth looking at, and agentic
          systems that handle the repetitive work behind them.
        </p>
      </div>

      <div className="relative min-h-[24rem] overflow-hidden bg-[#080b14] md:min-h-0">
        <HeroShardIsland />
      </div>
    </section>
  );
}
