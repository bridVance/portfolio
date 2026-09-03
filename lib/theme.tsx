"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "bv-theme";
const ORDER: ThemeChoice[] = ["light", "dark", "system"];

export const themeInitScript = `(function(){try{
var c=localStorage.getItem("${KEY}")||"system";
if(c==="light"||c==="dark"){document.documentElement.setAttribute("data-theme",c);}
}catch(e){}})();`;

function systemResolved(): "light" | "dark" {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type Ctx = {
  choice: ThemeChoice;
  resolved: "light" | "dark";
  setChoice: (c: ThemeChoice) => void;
  cycle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const el = document.documentElement;
  if (choice === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", choice);
  try { localStorage.setItem(KEY, choice); } catch { /* private mode */ }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [sys, setSys] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Client-only hydration: localStorage and matchMedia are unavailable during
    // SSR, so we mount with "system"/"light" and reconcile to the real stored
    // choice + OS scheme here. Deliberate external-system sync.
    // eslint-disable-next-line react/set-state-in-effect
    setChoiceState(readStored());
    // eslint-disable-next-line react/set-state-in-effect
    setSys(systemResolved());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSys(mq.matches ? "dark" : "light");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    apply(c);
  }, []);

  const cycle = useCallback(() => {
    const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
    setChoiceState(next);
    apply(next);
  }, [choice]);

  const resolved = choice === "system" ? sys : choice;

  const value = useMemo<Ctx>(
    () => ({ choice, resolved, setChoice, cycle }),
    [choice, resolved, setChoice, cycle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
