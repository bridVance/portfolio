"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { useGpuTier, createFpsGuard, type GpuTier } from "@/lib/gpu";
import { useInViewport } from "@/lib/useInViewport";
import { EffectBoundary } from "./EffectBoundary";
import { Poster } from "./Poster";

type PosterCfg = { src: string; width: number; height: number; priority?: boolean };

const RANK: Record<GpuTier, number> = { low: 0, mid: 1, high: 2 };

// How long the post-mount frame sampler runs before it gives up watching.
const SAMPLE_WINDOW_MS = 2500;

// Per-effect key for the session downgrade latch. `cfg.poster.src` is unique per
// effect (one poster asset each), so it is a stable, collision-free id.
const downgradeKey = (posterSrc: string) => `bv-fx-downgraded:${posterSrc}`;

function readDowngraded(posterSrc: string): boolean {
  try {
    return sessionStorage.getItem(downgradeKey(posterSrc)) === "1";
  } catch {
    return false;
  }
}

function writeDowngraded(posterSrc: string): void {
  try {
    sessionStorage.setItem(downgradeKey(posterSrc), "1");
  } catch {
    /* private mode / storage disabled — the in-memory latch still holds */
  }
}

/**
 * Poster plus a small, unobtrusive mono note. Rendered by the EffectBoundary
 * fallback path (spec §4.3: "the same `<Poster>` … plus a small mono note").
 * The note is `aria-hidden` — the poster already carries the visual meaning.
 */
function PosterWithNote({ poster }: { poster: PosterCfg }) {
  return (
    <div>
      <Poster {...poster} />
      <p aria-hidden className="mt-1 font-mono text-xs text-muted">
        effect unavailable
      </p>
    </div>
  );
}

export function dynamicEffect<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  cfg: {
    poster: PosterCfg;
    minTier?: "mid" | "high";
    rootMargin?: string;
    /** Applied to the island's wrapper `<div>` so the consumer can size it. */
    className?: string;
  }
): ComponentType<P> {
  const minRank = RANK[cfg.minTier ?? "mid"];
  const Lazy = dynamic(loader, { ssr: false, loading: () => <Poster {...cfg.poster} /> });

  return function EffectIsland(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    const tier = useGpuTier();

    // Viewport gate with hysteresis (spec §4.3): mount when the island comes
    // within ~200px of the viewport; keep it mounted until it is more than a
    // full viewport away, so a scroll parked on the boundary can't thrash
    // mount/unmount. Two observers on the same ref — cheap, and it keeps
    // `useInViewport` a plain single-threshold primitive.
    const near = useInViewport(ref, {
      rootMargin: cfg.rootMargin ?? "200px",
      once: false,
    });
    const withinOneViewport = useInViewport(ref, {
      rootMargin: "100% 0px 100% 0px",
      once: false,
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      if (near) setMounted(true);
      else if (!withinOneViewport) setMounted(false);
    }, [near, withinOneViewport]);

    // Session-scoped downgrade latch: once an effect has failed its FPS check
    // this session it never retries. Read synchronously so a pre-set flag means
    // the loader is never even requested.
    const [downgraded, setDowngraded] = useState(() => readDowngraded(cfg.poster.src));

    const live = RANK[tier] >= minRank && mounted && !downgraded;

    // Runtime FPS guard (spec §4.4). `dynamicEffect` doesn't own the effect's
    // rAF loop, so it runs its own short sampler right after the effect mounts:
    // feed frame timestamps to the guard for ~2s; if the median frame rate is
    // too low, swap to the poster for the rest of the session.
    useEffect(() => {
      if (!live) return;
      if (typeof requestAnimationFrame === "undefined") return;

      const guard = createFpsGuard({
        onFail: () => {
          setDowngraded(true);
          writeDowngraded(cfg.poster.src);
        },
      });

      let raf = 0;
      let startTs: number | null = null;
      const tick = (now: number) => {
        if (startTs === null) startTs = now;
        guard.frame(now);
        if (now - startTs < SAMPLE_WINDOW_MS) {
          raf = requestAnimationFrame(tick);
        } else {
          guard.stop();
        }
      };
      raf = requestAnimationFrame(tick);

      return () => {
        guard.stop();
        cancelAnimationFrame(raf);
      };
    }, [live]);

    return (
      <div ref={ref} className={cfg.className}>
        {live ? (
          <EffectBoundary fallback={<PosterWithNote poster={cfg.poster} />}>
            <Lazy {...props} />
          </EffectBoundary>
        ) : (
          <Poster {...cfg.poster} />
        )}
      </div>
    );
  };
}
