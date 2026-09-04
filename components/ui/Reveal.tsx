"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Props = {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  className?: string;
};

/**
 * Scroll-reveal wrapper (§8.4): fades + rises its children in once, when they
 * enter the viewport. Renders children plainly — fully visible, no motion —
 * before hydration and whenever `prefers-reduced-motion` is set, so content is
 * never hidden behind JS. Zero runtime deps (IntersectionObserver + a CSS
 * transition) to keep the home first-load JS within the §10.1 budget.
 *
 * Uses a dedicated observer rather than the shared `useInViewport`: the observe
 * must start only *after* the mount gate flips, and `useInViewport` latches
 * `true` if its effect runs while the ref is still null.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const reduce = usePrefersReducedMotion();

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduce) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, reduce]);

  // Pre-hydration and reduced-motion: a plain, fully-visible wrapper — no
  // transition, no initial opacity:0 — so content is never hidden behind JS.
  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition:
          "opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)",
        transitionDelay: `${delay}s`,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(14px)",
      }}
    >
      {children}
    </div>
  );
}
