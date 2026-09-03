"use client";

import { useEffect, useState, type RefObject } from "react";

export function useInViewport(
  ref: RefObject<Element | null>,
  opts: { rootMargin?: string; once?: boolean } = {}
): boolean {
  const { rootMargin = "200px", once = true } = opts;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true); // no IO support -> assume visible; tier gate still applies
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}
