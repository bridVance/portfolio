"use client";

import { useTheme, type ThemeChoice } from "@/lib/theme";

const NEXT_LABEL: Record<ThemeChoice, string> = {
  system: "Switch theme to light",
  light: "Switch theme to dark",
  dark: "Switch theme to system",
};
const GLYPH: Record<ThemeChoice, string> = { system: "◐", light: "○", dark: "●" };

export function ThemeToggle() {
  const { choice, cycle } = useTheme();
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={NEXT_LABEL[choice]}
      className="font-mono text-sm text-muted hover:text-fg"
    >
      <span aria-hidden>{GLYPH[choice]}</span>
    </button>
  );
}
