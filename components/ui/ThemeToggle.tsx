"use client";

import { useTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg
      className="theme-switch__i theme-switch__i--sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.7M12 19.3V21M4.6 4.6l1.2 1.2M18.2 18.2l1.2 1.2M3 12h1.7M19.3 12H21M4.6 19.4l1.2-1.2M18.2 5.8l1.2-1.2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-switch__i theme-switch__i--moon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20 14.6A8 8 0 1 1 9.4 4 6.5 6.5 0 0 0 20 14.6z" />
    </svg>
  );
}

/**
 * Theme switch: a compact sun/moon slider. Binary — light <-> dark — since a
 * two-position slider can't express the third "system" state; the site still
 * follows the OS scheme until the first toggle. Knob position and palette come
 * from CSS vars keyed off the resolved theme (see `.theme-switch` in
 * globals.css), so it paints correctly pre-hydration; `aria-checked` carries
 * the state for assistive tech.
 */
export function ThemeToggle() {
  const { resolved, setChoice } = useTheme();
  const isDark = resolved === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      className="theme-switch"
      onClick={() => setChoice(isDark ? "light" : "dark")}
    >
      <span className="theme-switch__knob" aria-hidden>
        <SunIcon />
        <MoonIcon />
      </span>
    </button>
  );
}
