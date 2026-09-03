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

export function detectGpuEnv(): GpuEnv {
  if (typeof window === "undefined") {
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
    webgl2 = !!c.getContext("webgl2");
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    webgl2,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    smallViewport: window.matchMedia("(max-width: 768px)").matches,
  };
}

export function useGpuTier(): GpuTier {
  const [tier, setTier] = useState<GpuTier>("low");
  useEffect(() => {
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
