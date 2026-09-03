"use client";

import dynamic from "next/dynamic";
import { useRef, type ComponentType } from "react";
import { useGpuTier, type GpuTier } from "@/lib/gpu";
import { useInViewport } from "@/lib/useInViewport";
import { EffectBoundary } from "./EffectBoundary";
import { Poster } from "./Poster";

type PosterCfg = { src: string; width: number; height: number };

const RANK: Record<GpuTier, number> = { low: 0, mid: 1, high: 2 };

export function dynamicEffect<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  cfg: { poster: PosterCfg; minTier?: "mid" | "high"; rootMargin?: string }
): ComponentType<P> {
  const minRank = RANK[cfg.minTier ?? "mid"];
  const Lazy = dynamic(loader, { ssr: false, loading: () => <Poster {...cfg.poster} /> });

  return function EffectIsland(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    const tier = useGpuTier();
    const inView = useInViewport(ref, { rootMargin: cfg.rootMargin });
    const allowed = RANK[tier] >= minRank && inView;

    return (
      <div ref={ref}>
        {allowed ? (
          <EffectBoundary fallback={<Poster {...cfg.poster} />}>
            <Lazy {...props} />
          </EffectBoundary>
        ) : (
          <Poster {...cfg.poster} />
        )}
      </div>
    );
  };
}
