"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LiquidGlass } from "./LiquidGlass";
import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { ROUTES } from "@/lib/routes";

// Home is the wordmark; Contact is the "Get in touch" button. Listing either
// again would be the same destination twice in one bar.
const NAV_ROUTES = ROUTES.filter((r) => r.href !== "/" && r.href !== "/contact");
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * A floating glass pill rather than a full-bleed bar: it detaches from the top
 * edge so the hero reads behind it, and the rounded shell keeps the primary
 * action visually contained instead of trailing off toward the corner.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  // usePathname is null outside a router context; treat that as "no route
  // is current" rather than letting it throw.
  const pathname = usePathname() ?? "";
  const home = pathname === "/";
  const reduce = usePrefersReducedMotion();
  const [set, setSet] = useState(false);
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setSet(true), []);
  const intensity = reduce || set ? 0.6 : 0.32;

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
      <LiquidGlass
        as="div"
        intensity={intensity}
        className="relative mx-auto w-fit max-w-full rounded-full border border-line shadow-sm"
      >
        <nav
          aria-label="Primary"
          className="flex items-center justify-between gap-5 py-2 pl-4 pr-2 md:gap-10 md:pl-6 md:pr-3"
        >
          <Link
            href="/"
            aria-current={home ? "page" : undefined}
            className={cn(
              "-my-1 inline-flex items-center gap-2.5 rounded-full py-1 transition-shadow",
              home ? "-mx-3 bg-surface-2 px-3 shadow-[0_1px_6px_rgba(0,0,0,0.10)]" : ""
            )}
          >
            <Mark gradient className="h-5 w-5 shrink-0" />
            <Wordmark />
          </Link>

          <button
            type="button"
            className="-my-1 py-1 font-mono text-sm md:hidden"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>

          <div
            id="nav-menu"
            className={cn(
              "absolute left-0 right-0 top-[calc(100%+0.5rem)] flex-col gap-1 rounded-2xl border border-line bg-surface p-4 shadow-sm",
              "md:static md:flex md:flex-row md:items-center md:gap-6 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none",
              open ? "flex" : "hidden md:flex"
            )}
          >
            {NAV_ROUTES.map((r) => {
              const current = pathname === r.href || pathname.startsWith(`${r.href}/`);
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "-mx-2 -my-1 rounded-full px-2 py-1 font-mono text-sm transition-colors",
                    current
                      ? "bg-surface-2 font-medium text-fg"
                      : "text-muted hover:text-fg"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {r.label}
                </Link>
              );
            })}

            <div className="mt-3 flex items-center gap-3 md:ml-1 md:mt-0">
              <ThemeToggle />
              {/* The pill's one solid action, mirroring the CTA that closes
                  every page — a visitor should never have to scroll to find it. */}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center rounded-full bg-fg px-4 py-2 font-mono text-sm text-bg transition-opacity hover:opacity-85 focus-visible:opacity-85"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </nav>
      </LiquidGlass>
    </header>
  );
}
