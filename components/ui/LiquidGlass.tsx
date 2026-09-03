import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  as?: ElementType;
  className?: string;
  intensity?: number;
  children: ReactNode;
};

/**
 * Frosted container for the site's "liquid glass" chrome (the top nav).
 *
 * Implemented as a pure CSS `backdrop-filter` surface: it refracts/blurs the
 * page content that scrolls behind it, works in Chromium and Safari, and
 * degrades to a plain translucent bar in Firefox. No DOM cloning and no runtime
 * dependency — `backdrop-filter` is the right primitive for a structural bar.
 * The `liquid-glass-js` package stays installed but unused here; it is reserved
 * for the Lab's draggable-lens demo, which will consume it directly.
 */
export function LiquidGlass({ as, className, intensity = 0.6, children }: Props) {
  const Tag = (as ?? "div") as ElementType;

  // Nominal (intensity 0.6): blur(14px) saturate(1.4). `intensity` scales it gently.
  const i = Math.max(0, Math.min(1, intensity));
  const round = (n: number) => String(Math.round(n * 100) / 100);
  const filter = `blur(${round(8 + i * 10)}px) saturate(${round(1.1 + i * 0.5)})`;

  return (
    <Tag
      data-glass="css"
      className={cn("border-b border-line", className)}
      style={{
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
        background: "color-mix(in srgb, var(--surface) 62%, transparent)",
      }}
    >
      {children}
    </Tag>
  );
}
