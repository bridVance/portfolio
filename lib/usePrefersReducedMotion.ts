"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion: reduce` as a reactive boolean. `false` during SSR and
 * the first client render (so nothing is gated off before hydration), then
 * reconciles to the real value and tracks changes.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // oxlint-disable-next-line react/set-state-in-effect
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
