"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
 * never hidden behind JS. Server render and first client render both emit the
 * plain wrapper, so there is no hydration mismatch.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
