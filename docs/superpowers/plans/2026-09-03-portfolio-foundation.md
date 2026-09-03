# BridVance Portfolio — Plan 1: Foundation & Shell

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable Next.js site for BridVance with the design-token/theme system, fonts, GPU-capability detection, the reusable GPU-island primitives, the liquid-glass nav, all five route shells, CI, and a Vercel deploy — with no visual effects mounted yet.

**Architecture:** Next.js App Router, statically rendered. All GPU/WebGL code is quarantined behind dynamic-import primitives so `three` never enters the shared bundle. A three-state theme system (light / dark / OS) drives everything through CSS custom properties mapped into Tailwind. `lib/gpu.ts` picks a capability tier at runtime; a shared `dynamicEffect()` helper composes `next/dynamic(ssr:false)` + error boundary + viewport gate + tier gate so every later effect follows one pattern.

**Tech Stack:** Next.js (App Router, latest 15.x), React 19, TypeScript, Tailwind CSS **v3**, `next/font`, framer-motion, `liquid-glass-js`, Vitest + Testing Library, Playwright, oxlint, `@next/bundle-analyzer`, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-03-portfolio-site-design.md` — the plan argues from the spec; executors read both.

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Framework:** Next.js App Router, React 19, TypeScript. Package manager **npm**; lockfile committed.
- **Tailwind v3** (not v4) — matches the studio's other repos.
- **`three` / `@react-three/*` must never appear in the shared / first-load JS bundle.** Only reachable via `next/dynamic`. CI asserts this.
- **The site is a complete site with zero WebGL** — every route, all content, and the forms render and function with no canvas and with JavaScript disabled (SSG + progressive enhancement). Effects are pure enhancement.
- **Every effect degrades to a static poster** on the low capability tier and under `prefers-reduced-motion`.
- **Capability tiers** (`lib/gpu.ts`): High = WebGL2 + no `prefers-reduced-motion` + no `save-data` + (`deviceMemory` unset or ≥ 8). Mid = WebGL2 but `deviceMemory` 4–8 or coarse pointer / small viewport. Low = no WebGL2, or `save-data`, or `deviceMemory` ≤ 4, or `prefers-reduced-motion`, or a failed runtime FPS check → posters only.
- **Performance budget:** LCP < 2.0s emulated 4G mobile; CLS ≈ 0; first-load shared JS < ~120 KB gzip excluding dynamically-loaded `three`.
- **Accessibility target WCAG 2.2 AA:** full keyboard nav, visible focus ring in `--accent`, skip link, semantic landmarks, one `<h1>` per page, `prefers-reduced-motion` honoured everywhere, canvases `aria-hidden`.
- **Palette tokens** (dark default): `--bg #080B14`, `--surface #0F1524`, `--surface-2 #161E33`, `--fg #E8EBF2`, `--muted #8791A8`, `--line #212A42`, `--accent #3B82F6`, `--accent-strong #4F8DFF`, `--status #37E0A8`, `--brand-grad linear-gradient(135deg,#1E3A8A,#3B82F6)`. Light: `--bg #F6F7FA`, `--surface #FFFFFF`, `--surface-2 #EEF1F7`, `--fg #0E1524`, `--muted #586079`, `--line #E2E5EE`, `--accent #1D4ED8`, `--accent-strong #2563EB`, `--status #0E9E76`.
- **Type:** Familjen Grotesk (display/UI), Newsreader (reading prose), JetBrains Mono (labels/tags/transcripts) — all self-hosted via `next/font/google`.
- **Routes for v1:** `/`, `/work`, `/lab`, `/automation`, `/contact` (plus `/lab/[slug]` in Plan 3).
- **Studio:** BridVance. Logo raster at `public/brand/` interim; SVG pending (`TODO(brand-svg)`).
- **No runtime third-party fetches** from effect libraries — everything bundled/self-hosted.
- **Copy voice:** active voice; a control says exactly what it does; errors explain what went wrong and how to fix it, no apologies; sentence case; no placeholder-as-label.

---

## File Structure

**Created in this plan:**

| Path | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.oxlintrc.json` | Project config. `next.config.mjs` wraps `@next/bundle-analyzer`. |
| `app/layout.tsx` | Root layout: `<html lang>` with font + theme setup, skip link, `<Nav>`, `<main>`, `<Footer>`. |
| `app/globals.css` | Token blocks (`:root` light / dark media / `[data-theme]`), base element styles, focus-visible ring, reduced-motion reset. |
| `app/fonts.ts` | `next/font/google` instances → CSS variables. |
| `app/page.tsx`, `app/work/page.tsx`, `app/lab/page.tsx`, `app/automation/page.tsx`, `app/contact/page.tsx` | Static route shells: one `<h1>`, section landmarks, `metadata`. |
| `app/robots.ts`, `app/sitemap.ts` | Read `SITE_URL`; list the five routes. |
| `lib/seo.ts` | `pageMetadata({ title, description, path })` helper. |
| `lib/theme.tsx` | `<ThemeProvider>`, `useTheme()`, the pre-hydration inline script that sets `data-theme` from `localStorage`/OS with no flash. |
| `lib/gpu.ts` | `getGpuTier()`, `useGpuTier()`, `createFpsGuard()`. |
| `lib/useInViewport.ts` | `useInViewport(ref, { rootMargin })` → boolean. |
| `lib/cn.ts` | `cn(...classes)` = `clsx` + `tailwind-merge`. |
| `components/effects/Poster.tsx` | Static poster `<img>` sized to exact dimensions, `aria-hidden`. |
| `components/effects/EffectBoundary.tsx` | Class error boundary → renders a passed fallback. |
| `components/effects/dynamicEffect.tsx` | Composes `next/dynamic(ssr:false)` + `EffectBoundary` + viewport gate + tier gate. The single pattern every future effect uses. |
| `components/ui/LiquidGlass.tsx` | Wraps `liquid-glass-js`; feature-detects SVG displacement; `backdrop-filter` fallback. |
| `components/ui/ThemeToggle.tsx` | Cycles light → dark → system; labelled button. |
| `components/ui/Nav.tsx` | Top bar: wordmark, route links, `<ThemeToggle>`, mobile disclosure menu; background is `<LiquidGlass>`. |
| `components/ui/Footer.tsx` | Studio line, route links, "back to top". |
| `components/ui/SkipLink.tsx` | Visually-hidden-until-focus link to `#main`. |
| `scripts/assert-bundle.mjs` | Fails if `three` / `@react-three` appears in a first-load chunk of `.next`. |
| `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts` | Test runners. |
| `.github/workflows/ci.yml` | typecheck → oxlint → vitest → build → bundle assertion → playwright. |
| `.env.example` | `SITE_URL`, `CONTACT_TO`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (only `SITE_URL` used in this plan). |
| `README.md` | Run/build/test/deploy commands. |
| `e2e/shell.spec.ts` | Playwright smoke across the five routes + a11y basics. |

**Branch:** work on `build/foundation`, PR into `main`. `main` is protected on Vercel as production.

---

## Task 1: Scaffold Next.js into the existing repo

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `next-env.d.ts`, `app/layout.tsx` (temporary), `app/page.tsx` (temporary), `app/globals.css` (temporary), `.gitignore` (merge)
- Test: `e2e/shell.spec.ts` is added in Task 10; this task's check is `npm run build`.

**Interfaces:**
- Produces: a buildable Next.js app at repo root; `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck` scripts.

- [ ] **Step 1: Create the branch**

```bash
cd portfolio-site
git checkout -b build/foundation
```

- [ ] **Step 2: Scaffold in a temp dir (create-next-app refuses a non-empty dir)**

```bash
cd ..
npx create-next-app@latest bv-scaffold \
  --typescript --app --eslint=false --tailwind=false \
  --no-src-dir --import-alias "@/*" --use-npm --turbopack=false
```

Answer any remaining prompt with the default. This produces a bare App Router + TS app (no Tailwind yet — added deliberately in Task 2 so we pin **v3**).

- [ ] **Step 3: Move scaffold files into the repo, preserving `.git` and `docs/`**

```bash
cd bv-scaffold
# copy everything except .git
cp -r app public next.config.* tsconfig.json next-env.d.ts package.json package-lock.json .gitignore ../portfolio-site/ 2>/dev/null || true
cd ../portfolio-site
```

Merge `.gitignore`: ensure it contains `node_modules/`, `.next/`, `.env*`, `!.env.example`, `.vercel`, `/playwright-report`, `/test-results`, `*.log`, `.DS_Store`.

- [ ] **Step 4: Convert `next.config` to `.mjs` and wrap the bundle analyzer**

Create `next.config.mjs`:

```js
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = process.env.ANALYZE === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};

export default withBundleAnalyzer({ enabled: analyze })(nextConfig);
```

Delete any generated `next.config.ts`/`next.config.js`.

- [ ] **Step 5: Set `package.json` scripts and install analyzer**

```bash
npm pkg set scripts.dev="next dev" scripts.build="next build" scripts.start="next start" \
  scripts.typecheck="tsc --noEmit" scripts.analyze="ANALYZE=true next build"
npm install -D @next/bundle-analyzer
```

- [ ] **Step 6: Run the build**

Run: `npm run build`
Expected: build completes; `.next/` produced; no type errors.

- [ ] **Step 7: Clean up and commit**

```bash
cd .. && rm -rf bv-scaffold && cd portfolio-site
git add -A
git commit -m "chore: scaffold Next.js App Router + TS into repo"
```

---

## Task 2: Tailwind v3 + design tokens

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.mjs`
- Modify: `app/globals.css` (replace scaffold contents)
- Test: `e2e/tokens.spec.ts`

**Interfaces:**
- Produces: Tailwind color names `bg`, `surface`, `surface-2`, `fg`, `muted`, `line`, `accent`, `accent-strong`, `status` resolving to the CSS custom properties; `--brand-grad` available as a raw var. `#main` scroll target and `.focus-ring` utility behaviour via `globals.css`.

- [ ] **Step 1: Write the failing test**

Create `e2e/tokens.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("dark tokens resolve on the un-stamped document", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  // #080B14
  expect(bg).toBe("rgb(8, 11, 20)");
});

test("explicit light theme beats OS dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  // #F6F7FA
  expect(bg).toBe("rgb(246, 247, 250)");
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx playwright test e2e/tokens.spec.ts` (after `npm run dev` in another shell, or rely on the webServer config added in Task 10 — for now run `npm run dev` first)
Expected: FAIL — body background is the scaffold default, not `rgb(8, 11, 20)`.

- [ ] **Step 3: Install Tailwind v3 + PostCSS**

```bash
npm install -D tailwindcss@^3.4 postcss@^8 autoprefixer@^10
```

Create `postcss.config.mjs`:

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 4: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        status: "var(--status)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #f6f7fa;
  --surface: #ffffff;
  --surface-2: #eef1f7;
  --fg: #0e1524;
  --muted: #586079;
  --line: #e2e5ee;
  --accent: #1d4ed8;
  --accent-strong: #2563eb;
  --status: #0e9e76;
  --brand-grad: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #080b14;
    --surface: #0f1524;
    --surface-2: #161e33;
    --fg: #e8ebf2;
    --muted: #8791a8;
    --line: #212a42;
    --accent: #3b82f6;
    --accent-strong: #4f8dff;
    --status: #37e0a8;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --bg: #080b14;
  --surface: #0f1524;
  --surface-2: #161e33;
  --fg: #e8ebf2;
  --muted: #8791a8;
  --line: #212a42;
  --accent: #3b82f6;
  --accent-strong: #4f8dff;
  --status: #37e0a8;
  color-scheme: dark;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body), Georgia, serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display), system-ui, sans-serif;
  text-wrap: balance;
  line-height: 1.1;
}

:where(a, button, input, textarea, select):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Import `globals.css` in `app/layout.tsx`** (if the scaffold used a different path, fix the import to `./globals.css`).

- [ ] **Step 7: Run the tests to confirm they pass**

Run: `npx playwright test e2e/tokens.spec.ts`
Expected: PASS both.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts postcss.config.mjs app/globals.css app/layout.tsx e2e/tokens.spec.ts
git commit -m "feat: Tailwind v3 + brand design tokens (light/dark/[data-theme])"
```

---

## Task 3: Fonts

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`
- Test: `e2e/fonts.spec.ts`

**Interfaces:**
- Produces: `fontVars` — a `className` string exposing `--font-display`, `--font-body`, `--font-mono` on `<html>`.

- [ ] **Step 1: Write the failing test**

`e2e/fonts.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("font CSS variables are defined on <html>", async ({ page }) => {
  await page.goto("/");
  const vars = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      display: s.getPropertyValue("--font-display").trim(),
      body: s.getPropertyValue("--font-body").trim(),
      mono: s.getPropertyValue("--font-mono").trim(),
    };
  });
  expect(vars.display).toContain("Familjen");
  expect(vars.body).toContain("Newsreader");
  expect(vars.mono).toContain("JetBrains");
});
```

- [ ] **Step 2: Run it — expect FAIL** (variables empty).

- [ ] **Step 3: Create `app/fonts.ts`**

```ts
import { Familjen_Grotesk, Newsreader, JetBrains_Mono } from "next/font/google";

const display = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVars = `${display.variable} ${body.variable} ${mono.variable}`;
```

- [ ] **Step 4: Apply in `app/layout.tsx`**

```tsx
import { fontVars } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Run the test — expect PASS.**

- [ ] **Step 6: Commit**

```bash
git add app/fonts.ts app/layout.tsx e2e/fonts.spec.ts
git commit -m "feat: self-hosted fonts (Familjen Grotesk / Newsreader / JetBrains Mono)"
```

---

## Task 4: Theme provider (light / dark / system, no flash)

**Files:**
- Create: `lib/theme.tsx`, `lib/cn.ts`
- Modify: `app/layout.tsx`
- Test: `lib/theme.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ThemeChoice = "light" | "dark" | "system"`
  - `<ThemeProvider>{children}</ThemeProvider>` — client component; on mount reconciles `data-theme`.
  - `useTheme(): { choice: ThemeChoice; resolved: "light" | "dark"; setChoice(c: ThemeChoice): void; cycle(): void }`
  - `themeInitScript: string` — inline IIFE string to run pre-hydration in `<head>`.
  - `cn(...args): string` from `lib/cn.ts`.

- [ ] **Step 1: Install helpers**

```bash
npm install clsx tailwind-merge
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts` and `vitest.setup.ts`**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add scripts:

```bash
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest"
```

- [ ] **Step 3: Write the failing test**

`lib/theme.test.tsx`:

```tsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { choice, resolved, cycle } = useTheme();
  return (
    <button onClick={cycle} data-choice={choice} data-resolved={resolved}>
      cycle
    </button>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({
    matches: q.includes("dark"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

test("defaults to system and resolves from prefers-color-scheme", () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  const btn = screen.getByRole("button");
  expect(btn).toHaveAttribute("data-choice", "system");
  expect(btn).toHaveAttribute("data-resolved", "dark");
});

test("cycle goes light -> dark -> system and stamps data-theme + persists", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  const btn = screen.getByRole("button");
  const user = userEvent.setup();

  await user.click(btn); // system -> light
  expect(btn).toHaveAttribute("data-choice", "light");
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("bv-theme")).toBe("light");

  await user.click(btn); // light -> dark
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

  await user.click(btn); // dark -> system
  expect(btn).toHaveAttribute("data-choice", "system");
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  expect(localStorage.getItem("bv-theme")).toBe("system");
});

test("reads a persisted choice on mount", () => {
  localStorage.setItem("bv-theme", "light");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByRole("button")).toHaveAttribute("data-choice", "light");
});
```

- [ ] **Step 4: Run it — expect FAIL** (module not found).

- [ ] **Step 5: Create `lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Create `lib/theme.tsx`**

```tsx
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
    setChoiceState(readStored());
    setSys(systemResolved());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSys(mq.matches ? "dark" : "light");
    mq.addEventListener("Compat" in mq ? "change" : "change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    apply(c);
  }, []);

  const cycle = useCallback(() => {
    setChoiceState((cur) => {
      const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
      apply(next);
      return next;
    });
  }, []);

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
```

- [ ] **Step 7: Wire into `app/layout.tsx`**

```tsx
import { fontVars } from "./fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Run tests — expect PASS.**

Run: `npm test -- lib/theme.test.tsx`

- [ ] **Step 9: Commit**

```bash
git add lib/theme.tsx lib/cn.ts vitest.config.ts vitest.setup.ts lib/theme.test.tsx app/layout.tsx package.json package-lock.json
git commit -m "feat: three-state theme system with no-flash init script"
```

---

## Task 5: `lib/gpu.ts` — capability tiers + FPS guard

**Files:**
- Create: `lib/gpu.ts`
- Test: `lib/gpu.test.ts`

**Interfaces:**
- Produces:
  - `type GpuTier = "high" | "mid" | "low"`
  - `getGpuTier(env?: GpuEnv): GpuTier` — pure function; `GpuEnv` = `{ webgl2: boolean; reducedMotion: boolean; saveData: boolean; deviceMemory?: number; coarsePointer: boolean; smallViewport: boolean }`.
  - `detectGpuEnv(): GpuEnv` — reads `window`/`navigator` (guards for SSR by returning a low-ish env).
  - `useGpuTier(): GpuTier` — hook; `"low"` during SSR/first paint, real tier after mount.
  - `createFpsGuard(opts: { sampleMs?: number; minFps?: number; onFail: () => void }): { frame(now: number): void; stop(): void }` — call `frame()` from a rAF loop; invokes `onFail` once if median FPS over the window is below `minFps`.

- [ ] **Step 1: Write the failing test**

`lib/gpu.test.ts`:

```ts
import { getGpuTier, createFpsGuard, type GpuEnv } from "./gpu";

const base: GpuEnv = {
  webgl2: true,
  reducedMotion: false,
  saveData: false,
  deviceMemory: undefined,
  coarsePointer: false,
  smallViewport: false,
};

test("high: webgl2, no flags, memory unset", () => {
  expect(getGpuTier(base)).toBe("high");
});

test("low: no webgl2", () => {
  expect(getGpuTier({ ...base, webgl2: false })).toBe("low");
});

test("low: reduced motion", () => {
  expect(getGpuTier({ ...base, reducedMotion: true })).toBe("low");
});

test("low: save-data", () => {
  expect(getGpuTier({ ...base, saveData: true })).toBe("low");
});

test("low: deviceMemory 4", () => {
  expect(getGpuTier({ ...base, deviceMemory: 4 })).toBe("low");
});

test("mid: deviceMemory 6", () => {
  expect(getGpuTier({ ...base, deviceMemory: 6 })).toBe("mid");
});

test("mid: coarse pointer on a small viewport", () => {
  expect(getGpuTier({ ...base, coarsePointer: true, smallViewport: true })).toBe("mid");
});

test("high: deviceMemory 8", () => {
  expect(getGpuTier({ ...base, deviceMemory: 8 })).toBe("high");
});

test("fps guard fires onFail once when frames are slow", () => {
  let fails = 0;
  const g = createFpsGuard({ sampleMs: 100, minFps: 30, onFail: () => (fails += 1) });
  // 5 frames, 50ms apart => 20fps, below 30
  [0, 50, 100, 150, 200].forEach((t) => g.frame(t));
  expect(fails).toBe(1);
  g.frame(250);
  expect(fails).toBe(1);
});

test("fps guard does not fire when frames are fast", () => {
  let fails = 0;
  const g = createFpsGuard({ sampleMs: 100, minFps: 30, onFail: () => (fails += 1) });
  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].forEach((t) => g.frame(t));
  expect(fails).toBe(0);
});
```

- [ ] **Step 2: Run it — expect FAIL.**

- [ ] **Step 3: Implement `lib/gpu.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

export type GpuTier = "high" | "mid" | "low";

export type GpuEnv = {
  webgl2: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number;
  coarsePointer: boolean;
  smallViewport: boolean;
};

export function getGpuTier(env: GpuEnv): GpuTier {
  if (!env.webgl2 || env.reducedMotion || env.saveData) return "low";
  if (env.deviceMemory !== undefined && env.deviceMemory <= 4) return "low";
  if (env.deviceMemory !== undefined && env.deviceMemory < 8) return "mid";
  if (env.coarsePointer && env.smallViewport) return "mid";
  return "high";
}

export function detectGpuEnv(): GpuEnv {
  if (typeof window === "undefined") {
    return {
      webgl2: false,
      reducedMotion: true,
      saveData: false,
      coarsePointer: true,
      smallViewport: true,
    };
  }
  let webgl2 = false;
  try {
    const c = document.createElement("canvas");
    webgl2 = !!c.getContext("webgl2");
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    webgl2,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    smallViewport: window.matchMedia("(max-width: 768px)").matches,
  };
}

export function useGpuTier(): GpuTier {
  const [tier, setTier] = useState<GpuTier>("low");
  useEffect(() => {
    setTier(getGpuTier(detectGpuEnv()));
  }, []);
  return tier;
}

export function createFpsGuard(opts: {
  sampleMs?: number;
  minFps?: number;
  onFail: () => void;
}) {
  const sampleMs = opts.sampleMs ?? 2000;
  const minFps = opts.minFps ?? 24;
  const times: number[] = [];
  let start: number | null = null;
  let done = false;

  return {
    frame(now: number) {
      if (done) return;
      if (start === null) start = now;
      times.push(now);
      if (now - start >= sampleMs) {
        done = true;
        const deltas: number[] = [];
        for (let i = 1; i < times.length; i++) deltas.push(times[i] - times[i - 1]);
        if (deltas.length === 0) return;
        deltas.sort((a, b) => a - b);
        const medianDelta = deltas[Math.floor(deltas.length / 2)];
        const fps = 1000 / medianDelta;
        if (fps < minFps) opts.onFail();
      }
    },
    stop() {
      done = true;
    },
  };
}
```

- [ ] **Step 4: Run tests — expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add lib/gpu.ts lib/gpu.test.ts
git commit -m "feat: GPU capability tiers + runtime FPS guard"
```

---

## Task 6: Viewport hook + effect-island primitives

**Files:**
- Create: `lib/useInViewport.ts`, `components/effects/Poster.tsx`, `components/effects/EffectBoundary.tsx`, `components/effects/dynamicEffect.tsx`
- Test: `lib/useInViewport.test.tsx`, `components/effects/EffectBoundary.test.tsx`, `components/effects/dynamicEffect.test.tsx`

**Interfaces:**
- Consumes: `useGpuTier` from `lib/gpu.ts`.
- Produces:
  - `useInViewport(ref: RefObject<Element>, opts?: { rootMargin?: string; once?: boolean }): boolean`
  - `<Poster src={string} width={number} height={number} alt="" className?={string} />` — `aria-hidden`, no layout shift.
  - `<EffectBoundary fallback={ReactNode}>{children}</EffectBoundary>`
  - `dynamicEffect(loader: () => Promise<{ default: ComponentType<P> }>, cfg: { poster: { src: string; width: number; height: number }; minTier?: "mid" | "high"; rootMargin?: string }): ComponentType<P>` — the returned component renders the poster until in-viewport AND tier ≥ minTier, then lazy-loads and mounts the effect inside an `EffectBoundary` whose fallback is the poster.

- [ ] **Step 1: Write failing tests**

`lib/useInViewport.test.tsx`:

```tsx
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useInViewport } from "./useInViewport";

let cb: (entries: Array<{ isIntersecting: boolean }>) => void;

beforeEach(() => {
  cb = () => {};
  class IO {
    constructor(fn: typeof cb) { cb = fn; }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  global.IntersectionObserver = IO;
});

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewport(ref, { once: true });
  return <div ref={ref} data-inview={inView ? "yes" : "no"} />;
}

test("flips to true on intersection and stays (once)", () => {
  render(<Probe />);
  expect(screen.getByRole("generic")).toHaveAttribute("data-inview", "no");
  act(() => cb([{ isIntersecting: true }]));
  expect(screen.getByRole("generic")).toHaveAttribute("data-inview", "yes");
  act(() => cb([{ isIntersecting: false }]));
  expect(screen.getByRole("generic")).toHaveAttribute("data-inview", "yes");
});
```

`components/effects/EffectBoundary.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { EffectBoundary } from "./EffectBoundary";

function Boom(): JSX.Element {
  throw new Error("gpu blew up");
}

test("renders fallback when a child throws", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <EffectBoundary fallback={<div>poster</div>}>
      <Boom />
    </EffectBoundary>
  );
  expect(screen.getByText("poster")).toBeInTheDocument();
  spy.mockRestore();
});

test("renders children when nothing throws", () => {
  render(
    <EffectBoundary fallback={<div>poster</div>}>
      <div>live effect</div>
    </EffectBoundary>
  );
  expect(screen.getByText("live effect")).toBeInTheDocument();
});
```

`components/effects/dynamicEffect.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { dynamicEffect } from "./dynamicEffect";

vi.mock("@/lib/gpu", () => ({ useGpuTier: () => "low" }));

test("low tier renders only the poster, never calls the loader", () => {
  const loader = vi.fn(() =>
    Promise.resolve({ default: () => <div>LIVE</div> })
  );
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/x.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  expect(screen.getByRole("img", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/x.webp"
  );
  expect(loader).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run all three — expect FAIL.**

- [ ] **Step 3: Implement `lib/useInViewport.ts`**

```ts
"use client";

import { useEffect, useState, type RefObject } from "react";

export function useInViewport(
  ref: RefObject<Element>,
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
```

- [ ] **Step 4: Implement `components/effects/EffectBoundary.tsx`**

```tsx
"use client";

import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { failed: boolean };

export class EffectBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== "production") console.error("[effect]", err);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
```

- [ ] **Step 5: Implement `components/effects/Poster.tsx`**

```tsx
type Props = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
};

export function Poster({ src, width, height, alt = "", className }: Props) {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      decoding="async"
      loading="lazy"
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}
```

- [ ] **Step 6: Implement `components/effects/dynamicEffect.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useRef, type ComponentType } from "react";
import { useGpuTier, type GpuTier } from "@/lib/gpu";
import { useInViewport } from "@/lib/useInViewport";
import { EffectBoundary } from "./EffectBoundary";
import { Poster } from "./Poster";

type PosterCfg = { src: string; width: number; height: number };

const RANK: Record<GpuTier, number> = { low: 0, mid: 1, high: 2 };

export function dynamicEffect<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  cfg: { poster: PosterCfg; minTier?: "mid" | "high"; rootMargin?: string }
): ComponentType<P> {
  const minRank = RANK[cfg.minTier ?? "mid"];
  const Lazy = dynamic(loader, { ssr: false, loading: () => <Poster {...cfg.poster} /> });

  return function EffectIsland(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    const tier = useGpuTier();
    const inView = useInViewport(ref, { rootMargin: cfg.rootMargin });
    const allowed = RANK[tier] >= minRank && inView;

    return (
      <div ref={ref}>
        {allowed ? (
          <EffectBoundary fallback={<Poster {...cfg.poster} />}>
            <Lazy {...props} />
          </EffectBoundary>
        ) : (
          <Poster {...cfg.poster} />
        )}
      </div>
    );
  };
}
```

- [ ] **Step 7: Run all tests — expect PASS.**

Run: `npm test`

- [ ] **Step 8: Commit**

```bash
git add lib/useInViewport.ts components/effects lib/useInViewport.test.tsx
git commit -m "feat: effect-island primitives (viewport gate, error boundary, dynamicEffect)"
```

---

## Task 7: `LiquidGlass` with cross-browser fallback

**Files:**
- Create: `components/ui/LiquidGlass.tsx`
- Test: `components/ui/LiquidGlass.test.tsx`

**Interfaces:**
- Produces: `<LiquidGlass as?={keyof JSX.IntrinsicElements} className?={string} intensity?={number}>{children}</LiquidGlass>` — renders a container that, where SVG `feDisplacementMap` is supported, runs `liquid-glass-js` against its own backdrop; otherwise applies a `backdrop-filter` blur+saturate style. Exposes `data-glass="live" | "fallback"` for tests.
- `supportsDisplacement(): boolean` exported for reuse.

- [ ] **Step 1: Install the lib**

```bash
npm install liquid-glass-js
```

- [ ] **Step 2: Write the failing test**

`components/ui/LiquidGlass.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const init = vi.fn();
vi.mock("liquid-glass-js", () => ({ default: init, createLiquidGlass: init }));

import { LiquidGlass } from "./LiquidGlass";

test("falls back to backdrop-filter when displacement is unsupported", () => {
  vi.stubGlobal("CSS", { supports: () => false });
  render(<LiquidGlass className="nav">hi</LiquidGlass>);
  const el = screen.getByText("hi");
  expect(el).toHaveAttribute("data-glass", "fallback");
  expect(el.style.backdropFilter || el.style.webkitBackdropFilter).toContain("blur");
  expect(init).not.toHaveBeenCalled();
});
```

*(The "live" path is exercised in Plan 4's Playwright run on a real engine; jsdom has no SVG filter support so a unit test there would be meaningless.)*

- [ ] **Step 3: Run it — expect FAIL.**

- [ ] **Step 4: Implement `components/ui/LiquidGlass.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function supportsDisplacement(): boolean {
  if (typeof window === "undefined") return false;
  // SVG feDisplacementMap driving backdrop is the capability liquid-glass-js needs.
  // Firefox does not apply it to backdrops; gate on a known-good combo.
  const okFilter =
    typeof CSS !== "undefined" &&
    CSS.supports("backdrop-filter", "url(#x)");
  return okFilter;
}

type Props = {
  as?: ElementType;
  className?: string;
  intensity?: number;
  children: ReactNode;
};

export function LiquidGlass({ as, className, intensity = 0.6, children }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"fallback" | "live">("fallback");

  useEffect(() => {
    let disposed = false;
    if (!supportsDisplacement()) return;
    setMode("live");
    (async () => {
      const mod = await import("liquid-glass-js");
      if (disposed || !ref.current) return;
      const create =
        (mod as { createLiquidGlass?: (el: Element, o: object) => { destroy?: () => void } })
          .createLiquidGlass ??
        (mod as { default?: (el: Element, o: object) => { destroy?: () => void } }).default;
      const instance = create?.(ref.current, { intensity });
      return () => instance?.destroy?.();
    })();
    return () => {
      disposed = true;
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
```

- [ ] **Step 5: Run the test — expect PASS.**

- [ ] **Step 6: Commit**

```bash
git add components/ui/LiquidGlass.tsx components/ui/LiquidGlass.test.tsx package.json package-lock.json
git commit -m "feat: LiquidGlass component with backdrop-filter fallback"
```

---

## Task 8: Skip link, ThemeToggle, Nav, Footer, layout shell

**Files:**
- Create: `components/ui/SkipLink.tsx`, `components/ui/ThemeToggle.tsx`, `components/ui/Nav.tsx`, `components/ui/Footer.tsx`, `lib/routes.ts`
- Modify: `app/layout.tsx`
- Test: `components/ui/Nav.test.tsx`, `components/ui/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `LiquidGlass`, `useTheme`.
- Produces:
  - `ROUTES: { href: string; label: string }[]` from `lib/routes.ts` — `/` "Home", `/work` "Work", `/lab` "Lab", `/automation` "Automation", `/contact` "Contact".
  - `<SkipLink />` → anchor to `#main`.
  - `<ThemeToggle />` → `<button>` with `aria-label` reflecting the next choice.
  - `<Nav />`, `<Footer />`.

- [ ] **Step 1: Write failing tests**

`components/ui/ThemeToggle.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener() {}, removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

test("button announces the action and cycles", async () => {
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const btn = screen.getByRole("button");
  expect(btn).toHaveAccessibleName(/theme/i);
  await userEvent.click(btn);
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});
```

`components/ui/Nav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/lib/theme";
import { Nav } from "./Nav";
import { ROUTES } from "@/lib/routes";

vi.mock("liquid-glass-js", () => ({ default: vi.fn(), createLiquidGlass: vi.fn() }));

test("renders a link for every route and the wordmark", () => {
  render(<ThemeProvider><Nav /></ThemeProvider>);
  for (const r of ROUTES) {
    expect(screen.getByRole("link", { name: r.label })).toHaveAttribute("href", r.href);
  }
  expect(screen.getByRole("link", { name: /bridvance/i })).toHaveAttribute("href", "/");
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Create `lib/routes.ts`**

```ts
export const ROUTES = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/lab", label: "Lab" },
  { href: "/automation", label: "Automation" },
  { href: "/contact", label: "Contact" },
] as const;
```

- [ ] **Step 4: Create `components/ui/SkipLink.tsx`**

```tsx
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-fg"
    >
      Skip to content
    </a>
  );
}
```

Add the `sr-only` / `not-sr-only` utilities: they ship with Tailwind's default preflight plugins in v3 — no action needed.

- [ ] **Step 5: Create `components/ui/ThemeToggle.tsx`**

```tsx
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
```

- [ ] **Step 6: Create `components/ui/Nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { LiquidGlass } from "./LiquidGlass";
import { ThemeToggle } from "./ThemeToggle";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <LiquidGlass as="header" className="sticky top-0 z-40">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <Link href="/" className="font-display text-lg font-600 tracking-tight">
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
```

- [ ] **Step 7: Create `components/ui/Footer.tsx`**

```tsx
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-mono">BridVance — design &amp; agentic automation</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="hover:text-fg">
              {r.label}
            </Link>
          ))}
          <a href="#main" className="hover:text-fg">Back to top</a>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Update `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { fontVars } from "./fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { SkipLink } from "@/components/ui/SkipLink";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BridVance", template: "%s — BridVance" },
  description: "A studio building distinctive web front-ends and agentic automation systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg">
        <ThemeProvider>
          <SkipLink />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Run tests — expect PASS.** Run: `npm test`

- [ ] **Step 10: Commit**

```bash
git add components/ui lib/routes.ts app/layout.tsx
git commit -m "feat: nav (liquid-glass), footer, theme toggle, skip link, layout shell"
```

---

## Task 9: Route shells + metadata + robots/sitemap

**Files:**
- Create: `lib/seo.ts`, `app/page.tsx`, `app/work/page.tsx`, `app/lab/page.tsx`, `app/automation/page.tsx`, `app/contact/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `components/ui/PageHeader.tsx`
- Test: `e2e/routes.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `pageMetadata({ title, description, path }): Metadata` from `lib/seo.ts`.
  - `<PageHeader eyebrow={string} title={string} lede?={string} />` — renders `<h1>` + supporting text.
  - Five routes each returning a static page with exactly one `<h1>`.

- [ ] **Step 1: Write the failing test**

`e2e/routes.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: /bridvance/i, title: /BridVance/ },
  { path: "/work", h1: /work/i, title: /Work — BridVance/ },
  { path: "/lab", h1: /lab/i, title: /Lab — BridVance/ },
  { path: "/automation", h1: /automation/i, title: /Automation — BridVance/ },
  { path: "/contact", h1: /contact|start a project/i, title: /Contact — BridVance/ },
];

for (const r of ROUTES) {
  test(`${r.path} renders one h1 and a title`, async ({ page }) => {
    await page.goto(r.path);
    await expect(page).toHaveTitle(r.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(r.h1);
  });
}

test("sitemap lists all five routes", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const p of ["/", "/work", "/lab", "/automation", "/contact"]) {
    expect(xml).toContain(p === "/" ? "<loc>" : p);
  }
});

test("no horizontal scroll at 320px on every route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const r of ROUTES) {
    await page.goto(r.path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow, `${r.path} overflows at 320px`).toBe(false);
  }
});
```

- [ ] **Step 2: Run — expect FAIL** (routes/titles missing).

- [ ] **Step 3: Create `lib/seo.ts`**

```ts
import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://bridvance.example";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(opts.path, SITE_URL).toString();
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: `${opts.title} — BridVance`, description: opts.description, url },
  };
}

export { SITE_URL };
```

- [ ] **Step 4: Create `components/ui/PageHeader.tsx`**

```tsx
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mx-auto max-w-3xl px-4 pb-10 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-500 md:text-5xl">{title}</h1>
      {lede ? <p className="mt-4 max-w-[60ch] text-muted">{lede}</p> : null}
    </header>
  );
}
```

- [ ] **Step 5: Create the five pages**

`app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">BridVance</p>
      <h1 className="mt-3 text-4xl font-500 md:text-6xl">
        Distinctive front-ends. Automation that actually runs.
      </h1>
      <p className="mt-6 max-w-[60ch] text-muted">
        A small studio building web experiences worth looking at, and agentic
        systems that handle the repetitive work behind them.
      </p>
    </div>
  );
}
```

`app/work/page.tsx`:

```tsx
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Work",
  description: "Selected BridVance projects — commerce, portals, and product front-ends.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageHeader
      eyebrow="Selected work"
      title="Work"
      lede="Six projects across commerce, B2B portals, and product UI. Full case studies are in progress."
    />
  );
}
```

`app/lab/page.tsx`:

```tsx
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Interactive front-end experiments — shaders, 3D, glass, kinetic type.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <PageHeader
      eyebrow="Experiments"
      title="Lab"
      lede="Real, runnable demos of the techniques we use in production work."
    />
  );
}
```

`app/automation/page.tsx`:

```tsx
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Automation",
  description: "Agentic systems for clinics, real estate, and more — request a sample for your business.",
  path: "/automation",
});

export default function AutomationPage() {
  return (
    <PageHeader
      eyebrow="Agentic systems"
      title="Automation"
      lede="Systems that run one repetitive workflow end to end, plugged into the tools you already use."
    />
  );
}
```

`app/contact/page.tsx`:

```tsx
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Start a project or request an automation sample.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageHeader
      eyebrow="Get in touch"
      title="Start a project"
      lede="Tell us what you're building. We reply within one business day."
    />
  );
}
```

- [ ] **Step 6: Create `app/robots.ts` and `app/sitemap.ts`**

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
```

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", "/work", "/lab", "/automation", "/contact"].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: now,
  }));
}
```

- [ ] **Step 7: Run tests — expect PASS.**

Run: `npx playwright test e2e/routes.spec.ts`

- [ ] **Step 8: Commit**

```bash
git add lib/seo.ts components/ui/PageHeader.tsx "app/**/page.tsx" app/robots.ts app/sitemap.ts e2e/routes.spec.ts
git commit -m "feat: five static route shells, metadata, robots + sitemap"
```

---

## Task 10: Playwright config, CI, bundle assertion, README, deploy

**Files:**
- Create: `playwright.config.ts`, `e2e/shell.spec.ts`, `scripts/assert-bundle.mjs`, `.oxlintrc.json`, `.github/workflows/ci.yml`, `.env.example`, `README.md`, `vercel.json`
- Modify: `package.json`
- Test: the full `npm run verify` chain green locally.

**Interfaces:**
- Produces: `npm run lint`, `npm run e2e`, `npm run verify` scripts. `scripts/assert-bundle.mjs` exits non-zero if `three` / `@react-three` is found in a first-load chunk.

- [ ] **Step 1: Install runners**

```bash
npm install -D @playwright/test oxlint
npx playwright install --with-deps chromium firefox webkit
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
});
```

- [ ] **Step 3: Write `e2e/shell.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("theme toggle cycles and persists", async ({ page }) => {
  await page.goto("/");
  const btn = page.getByRole("button", { name: /theme/i });
  await btn.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("skip link is reachable and targets #main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const link = page.getByRole("link", { name: /skip to content/i });
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute("href", "#main");
});

test("reduced-motion emulation renders no <canvas>", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("primary nav is fully keyboard operable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Work" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work$/);
});
```

- [ ] **Step 4: Write `scripts/assert-bundle.mjs`**

```js
import { readFileSync, existsSync } from "node:fs";
import { globSync } from "node:fs";

const manifestPath = ".next/app-build-manifest.json";
if (!existsSync(manifestPath)) {
  console.error("assert-bundle: run `next build` first");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const firstLoad = new Set();
for (const files of Object.values(manifest.pages ?? {})) {
  for (const f of files) firstLoad.add(f);
}

const offenders = [];
for (const chunk of firstLoad) {
  if (!chunk.endsWith(".js")) continue;
  const src = readFileSync(`.next/${chunk}`, "utf8");
  if (/three\/build\/three|@react-three\/fiber/.test(src)) offenders.push(chunk);
}

if (offenders.length) {
  console.error("assert-bundle: `three` leaked into first-load chunks:");
  for (const o of offenders) console.error("  - " + o);
  process.exit(1);
}
console.log(`assert-bundle: OK — ${firstLoad.size} first-load chunks, no three.js`);
```

- [ ] **Step 5: Add scripts + oxlint config**

```bash
npm pkg set scripts.lint="oxlint ." scripts.e2e="playwright test" \
  scripts["assert:bundle"]="node scripts/assert-bundle.mjs" \
  scripts.verify="npm run typecheck && npm run lint && npm run test && npm run build && npm run assert:bundle && npm run e2e"
```

`.oxlintrc.json`:

```json
{ "$schema": "./node_modules/oxlint/configuration_schema.json", "categories": { "correctness": "error" }, "ignorePatterns": [".next", "node_modules", "playwright-report"] }
```

- [ ] **Step 6: `.env.example`**

```
# Public site origin — used by sitemap/robots/canonical
SITE_URL=https://bridvance.example

# Plan 4 (form): not needed for Plan 1
CONTACT_TO=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

- [ ] **Step 7: `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24", cache: "npm" }
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox webkit
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
        env: { SITE_URL: "https://bridvance.example" }
      - run: npm run assert:bundle
      - run: npm run e2e
        env: { SITE_URL: "https://bridvance.example" }
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: playwright-report, path: playwright-report/ }
```

- [ ] **Step 8: `vercel.json` + `README.md`**

`vercel.json`:

```json
{ "framework": "nextjs", "buildCommand": "next build" }
```

`README.md` — document: `npm run dev`, `npm run verify`, the env vars, and the deploy step:

```md
# BridVance

Studio portfolio. Next.js (App Router) + Tailwind v3, deployed on Vercel.

## Develop
npm install
npm run dev

## Verify (what CI runs)
npm run verify

## Deploy
Push to `main` → Vercel production. PRs → preview URLs.
Set `SITE_URL` (and later the form env vars) in Vercel project settings.
```

- [ ] **Step 9: Run the full chain locally**

Run: `npm run verify`
Expected: typecheck clean, oxlint clean, Vitest green, `next build` succeeds, `assert:bundle` prints OK, Playwright green across all five projects.

- [ ] **Step 10: Commit and open the PR**

```bash
git add -A
git commit -m "chore: Playwright, CI, bundle assertion, README, Vercel config"
git push -u origin build/foundation
```

Then: open a PR into `main`; connect the repo to Vercel (Import Project → set `SITE_URL`); confirm the preview deploy renders all five routes and CI passes; merge.

---

## Self-Review

**1. Spec coverage (Plan 1 scope only):**

| Spec ref | Covered by |
|---|---|
| §4.1 framework, npm, Tailwind v3, Vercel | Tasks 1, 2, 10 |
| §4.2 file structure (`app/`, `lib/`, `components/`, `content/` dir) | Tasks 1, 6–9 (`content/` created empty in Plan 2) |
| §4.3 island pattern (`dynamic ssr:false` + poster + error boundary + viewport gate) | Task 6 `dynamicEffect` |
| §4.3 `three` never in shared bundle + CI assertion | Task 10 `assert-bundle.mjs` + `ci.yml` |
| §4.4 capability tiers + FPS guard | Task 5 |
| §5 five routes, one h1 each, metadata | Task 9 |
| §8.1 palette tokens, 3-state theme | Tasks 2, 4 |
| §8.2 fonts self-hosted | Task 3 |
| §8.3 liquid-glass nav signature + fallback | Tasks 7, 8 |
| §8.3 wordmark = mark + display face | Task 8 (text wordmark; SVG mark swap is `TODO(brand-svg)`, Plan 2) |
| §10.1 `next/font`, AVIF/WebP config, bundle budget | Tasks 1, 3, 10 |
| §10.2 keyboard nav, focus ring, skip link, landmarks, reduced-motion | Tasks 2, 8, 9, 10 |
| §11 Vitest + Testing Library + Playwright matrix + CI | Tasks 4, 10 |
| §12 Vercel git integration, `SITE_URL` env, sitemap/robots host | Tasks 9, 10 |

Deferred to later plans by design: security headers/CSP + `api/contact` (Plan 4), any effect implementation (Plans 2–3), `content/*` data (Plans 2–4).

**2. Placeholder scan:** No "TBD/TODO" in steps. `TODO(brand-svg)` is a tracked spec input (§3), not a plan gap — the text wordmark ships and the SVG mark swaps in during Plan 2. All code steps contain runnable code.

**3. Type consistency:** `GpuTier` ("high"|"mid"|"low") is defined in Task 5 and consumed by `dynamicEffect` in Task 6 with the same literals and a `RANK` map. `ThemeChoice` defined in Task 4, consumed in Task 8's `ThemeToggle` with matching `NEXT_LABEL`/`GLYPH` keys. `ROUTES` shape (`{href,label}`) defined in Task 8, consumed by `Nav`, `Footer`, and `e2e/routes.spec.ts`. `pageMetadata`/`SITE_URL` defined in Task 9, consumed by four page files + `robots.ts` + `sitemap.ts`. `Poster` prop shape (`src,width,height,alt?,className?`) defined in Task 6, used identically by `dynamicEffect`. `<LiquidGlass>` prop `as` used as `"header"` in Task 8 matches its `ElementType` signature in Task 7.

**4. Known follow-ups for the executor:**
- `next/font/google` export name is `Familjen_Grotesk` — confirm against the installed `next` version; if the font isn't in the Google set for that version, fall back to `localFont` with the woff2 committed under `app/fonts/`.
- `create-next-app` flag names drift between majors; if `--tailwind=false` is rejected, scaffold with defaults and remove the v4 Tailwind files before Task 2.
