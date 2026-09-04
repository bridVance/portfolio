"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiquidGlass } from "./LiquidGlass";
import { ThemeToggle } from "./ThemeToggle";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = usePrefersReducedMotion();
  const [set, setSet] = useState(false);
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setSet(true), []);
  const intensity = reduce || set ? 0.6 : 0.32;
  return (
    <LiquidGlass as="header" intensity={intensity} className="sticky top-0 z-40">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          BridVance
        </Link>

        <button
          type="button"
          className="font-mono text-sm md:hidden"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <div
          id="nav-menu"
          className={cn(
            "absolute left-0 right-0 top-full flex-col gap-1 bg-surface p-4 md:static md:flex md:flex-row md:items-center md:gap-6 md:bg-transparent md:p-0",
            open ? "flex" : "hidden md:flex"
          )}
        >
          {ROUTES.filter((r) => r.href !== "/").map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="font-mono text-sm text-muted hover:text-fg"
              onClick={() => setOpen(false)}
            >
              {r.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </LiquidGlass>
  );
}
