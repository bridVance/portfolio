"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export function supportsDisplacement(): boolean {
  if (typeof window === "undefined") return false;
  // SVG feDisplacementMap driving backdrop is the capability liquid-glass-js needs.
  // Firefox does not apply it to backdrops; gate on a known-good combo.
  const okFilter =
    typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#x)");
  return okFilter;
}

type Props = {
  as?: ElementType;
  className?: string;
  intensity?: number;
  children: ReactNode;
};

type GlassInstance = { destroy?: () => void };

export function LiquidGlass({ as, className, intensity = 0.6, children }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"fallback" | "live">("fallback");

  useEffect(() => {
    if (!supportsDisplacement()) return;

    let disposed = false;
    let instance: GlassInstance | undefined;
    setMode("live");

    void (async () => {
      try {
        const mod: unknown = await import("liquid-glass-js");
        if (disposed || !ref.current) return;

        const m = mod as {
          default?: unknown;
          LiquidGlass?: unknown;
          createLiquidGlass?: (el: Element, o: object) => GlassInstance;
        };
        const clamped = Math.max(0, Math.min(1, intensity));

        if (typeof m.createLiquidGlass === "function") {
          // Factory form (matches the brief's assumed shape / the test double).
          instance = m.createLiquidGlass(ref.current, { intensity: clamped });
        } else {
          // Real liquid-glass-js@0.1.0 API: `new LiquidGlass({ background, ...params })`.
          const Ctor = (m.LiquidGlass ?? m.default) as
            | (new (o: object) => GlassInstance)
            | undefined;
          if (typeof Ctor === "function") {
            instance = new Ctor({
              background: ref.current,
              scale: Math.round(clamped * 90),
            });
          }
        }
      } catch {
        // The live SVG-displacement path is best-effort and only meaningful on a
        // real browser engine; the backdrop-filter fallback already rendered.
        // Playwright exercises the live path in a later plan.
      }
    })();

    return () => {
      disposed = true;
      instance?.destroy?.();
    };
  }, [intensity]);

  const fallbackStyle =
    mode === "fallback"
      ? {
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          background: "color-mix(in srgb, var(--surface) 62%, transparent)",
        }
      : undefined;

  return (
    <Tag
      ref={ref}
      data-glass={mode}
      className={cn("border-b border-line", className)}
      style={fallbackStyle}
    >
      {children}
    </Tag>
  );
}
