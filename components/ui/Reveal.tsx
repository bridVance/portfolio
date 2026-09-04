"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  className?: string;
};

/**
 * Scroll-reveal wrapper (§8.4): fades + rises its children in once, when they
 * enter the viewport. The hidden state lives in the server-rendered `.bv-rise`
 * class (see globals.css), so the transition only ever runs 0 -> 1 and content
 * is never hidden behind JS: a `<noscript>` override in the document head and
 * the reduced-motion `@media` rule both force it visible. Zero runtime deps
 * beyond an IntersectionObserver.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div
      ref={ref}
      className={cn("bv-rise", className)}
      data-shown={shown || undefined}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
