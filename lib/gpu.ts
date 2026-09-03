"use client";

import { useEffect, useState } from "react";

export type GpuTier = "high" | "mid" | "low";

export type GpuEnv = {
  webgl2: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number;
  coarsePointer: boolean;
  smallViewport: boolean;
};

export function getGpuTier(env: GpuEnv): GpuTier {
  if (!env.webgl2 || env.reducedMotion || env.saveData) return "low";
  if (env.deviceMemory !== undefined && env.deviceMemory <= 4) return "low";
  if (env.deviceMemory !== undefined && env.deviceMemory < 8) return "mid";
  if (env.coarsePointer && env.smallViewport) return "mid";
  return "high";
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The static half of the environment — WebGL2 support, memory, pointer type,
// viewport class — never changes for the life of the page, but creating a
// throwaway <canvas> + WebGL2 context on every island mount leaks GPU contexts
// (browsers cap them at ~16 and then start dropping the oldest). Probe once,
// cache, and only re-read `prefers-reduced-motion` per call since the user can
// flip it live.
let cachedStaticEnv: Omit<GpuEnv, "reducedMotion"> | null = null;

export function detectGpuEnv(): GpuEnv {
  if (cachedStaticEnv) {
    return { ...cachedStaticEnv, reducedMotion: readReducedMotion() };
  }

  if (typeof window === "undefined") {
    // Don't cache the SSR shape — the client recomputes it after hydration.
    return {
      webgl2: false,
      reducedMotion: true,
      saveData: false,
      coarsePointer: true,
      smallViewport: true,
    };
  }

  let webgl2 = false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") as WebGL2RenderingContext | null;
    webgl2 = !!gl;
    // Release the probe context immediately so it doesn't sit against the cap.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  cachedStaticEnv = {
    webgl2,
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    smallViewport: window.matchMedia("(max-width: 768px)").matches,
  };
  return { ...cachedStaticEnv, reducedMotion: readReducedMotion() };
}

export function useGpuTier(): GpuTier {
  const [tier, setTier] = useState<GpuTier>("low");
  useEffect(() => {
    // Client-only capability probe: WebGL2 / deviceMemory / matchMedia don't
    // exist during SSR, so we render the safe "low" default and upgrade after
    // mount. This is external-system synchronization, not derivable state.
    // eslint-disable-next-line react/set-state-in-effect
    setTier(getGpuTier(detectGpuEnv()));
  }, []);
  return tier;
}

export function createFpsGuard(opts: {
  sampleMs?: number;
  minFps?: number;
  onFail: () => void;
}) {
  const sampleMs = opts.sampleMs ?? 2000;
  const minFps = opts.minFps ?? 24;
  const times: number[] = [];
  let start: number | null = null;
  let done = false;

  return {
    frame(now: number) {
      if (done) return;
      if (start === null) start = now;
      times.push(now);
      if (now - start >= sampleMs) {
        done = true;
        const deltas: number[] = [];
        for (let i = 1; i < times.length; i++) deltas.push(times[i] - times[i - 1]);
        if (deltas.length === 0) return;
        deltas.sort((a, b) => a - b);
        const medianDelta = deltas[Math.floor(deltas.length / 2)];
        const fps = 1000 / medianDelta;
        if (fps < minFps) opts.onFail();
      }
    },
    stop() {
      done = true;
    },
  };
}
