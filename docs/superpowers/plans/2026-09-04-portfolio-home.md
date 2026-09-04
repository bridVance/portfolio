# BridVance Portfolio — Plan 2: Home Page Spine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Home page below the (already-shipped) hero — the thesis line, the design↔automation split, the "how we build" band, the contact band — plus a shared motion/heading kit, the one-time hero page-load choreography, the brand mark in the nav, and the `@lhci/cli` budget gate.

**Architecture:** `app/page.tsx` composes discrete section components under `components/home/`. A shared `<Reveal>` (framer-motion `whileInView`, reduced-motion / pre-hydration → plain wrapper) fades each section opener in with a per-section stagger delay; that stagger *is* the "orchestrated settle" — there is no central timeline. A `<SectionHeading>` renders the §8.3 divider (hairline + mono label + checkmark `<Mark>`). The hero's load choreography (shard fade-up, headline settle, nav glass "set") is added piecewise, each piece keyed off its own component mount. Nothing new enters the first-load JS bundle; `three` stays behind the existing island.

**Tech Stack:** Next.js 15.5.25 App Router (webpack build), React 19, TypeScript, Tailwind CSS v3, **framer-motion** (new), `@lhci/cli` (new dev dep), Vitest + Testing Library, Playwright, oxlint.

**Spec:** `docs/superpowers/specs/2026-09-03-portfolio-site-design.md` — §5.1 (Home), §8.1–8.4 (visual system / layout signature / motion), §10.1 (perf budget), §10.4 ("how we build" band), §11 (testing / LHCI). The plan argues from the spec; executors read both. The spec was reconciled with the shipped hero in commit `87b1d1d`.

## Global Constraints

Copied from the spec. Every task's requirements implicitly include this section.

- **Framework:** Next.js App Router, React 19, TypeScript. Package manager **npm**; lockfile committed. Build stays on **webpack** (not Turbopack — it breaks `@next/bundle-analyzer`).
- **Tailwind v3** (not v4).
- **`three` / `@react-three/*` never appear in the shared / first-load JS bundle.** Only reachable via `next/dynamic`. `npm run assert:bundle` enforces this and MUST stay green after every task.
- **The site is complete with zero WebGL:** every route and all content render and function with no canvas and with JavaScript disabled (SSG + progressive enhancement). Effects and motion are pure enhancement — **`<Reveal>` must never hide content when JS is off or before hydration.**
- **`prefers-reduced-motion` honoured everywhere:** no transforms, no fades, no stagger — final state rendered immediately; the hero shard freezes on one frame.
- **Performance budget (§10.1):** LCP < 2.0 s emulated 4G mobile; CLS ≈ 0; TBT < 200 ms. First-load shared JS < ~120 KB gzip **excluding** dynamically-loaded `three` (authoritative check: the `next build` "First Load JS" report + `assert:bundle`).
- **Accessibility WCAG 2.2 AA (§10.2):** full keyboard nav; visible focus ring in `--accent` (a control on an `--accent` background overrides the ring colour to stay visible); skip link; semantic landmarks; **exactly one `<h1>` per page**, logical heading order; canvases `aria-hidden`; axe has no serious/critical violations on `/`.
- **Palette tokens** — dark (default): `--bg #080B14`, `--surface #0F1524`, `--surface-2 #161E33`, `--fg #E8EBF2`, `--muted #8791A8`, `--line #212A42`, `--accent #3B82F6`, `--accent-strong #4F8DFF`, `--brand-grad linear-gradient(135deg,#1E3A8A,#3B82F6)`. Light: `--bg #F6F7FA`, `--surface #FFFFFF`, `--surface-2 #EEF1F7`, `--fg #0E1524`, `--muted #586079`, `--line #E2E5EE`, `--accent #1D4ED8`, `--accent-strong #2563EB`. `--brand-grad` is **wordmark + liquid-metal demo only — never a page/section background.**
- **Type:** Familjen Grotesk (`font-display`, the `body` default — nav, buttons, labels, UI), Newsreader (`font-body`, opt-in on prose containers only), JetBrains Mono (`font-mono`, labels/tags). Uppercase labels get letter-spacing.
- **Layout signature (§8.3):** single-column-with-wide-margins spine for reading; full-bleed only for hero and Lab. Section dividers = one hairline + a mono label, labels only where they name real structure. The `V`/checkmark motif is the divider mark and the "how we build" step marker — never filler bullets.
- **The hero is the one deliberately saturated moment (§8.1).** Everything in this plan stays navy/cream chrome + `--muted` text; the single solid `--accent` element on the page is the contact-band button.
- **Copy voice:** active voice; a control says exactly what it does; sentence case; no placeholder-as-label. Copy strings in this plan are a first draft — implement them verbatim; the user redlines in review.
- **Routes:** `/`, `/work`, `/lab`, `/automation`, `/contact` already exist as shells. `ROUTES` is exported from `lib/routes.ts`.
- **Branch:** all work on `build/home`, PR into `main`. `main` is Vercel production.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `components/ui/Mark.tsx` | The `V`/checkmark motif — one tiny inline SVG. `currentColor` by default; `gradient` prop paints `--brand-grad` for the wordmark. Server-safe (no hooks). |
| `components/ui/Mark.test.tsx` | Renders an svg path; `gradient` toggles a `<linearGradient>` + `url(#…)` stroke. |
| `components/ui/Reveal.tsx` | Client. `mounted` gate + `useReducedMotion()`. Plain `<div>` wrapper before hydration and under reduced-motion (content always visible); otherwise a framer-motion fade+rise on `whileInView` (`once`), with an optional `delay` for stagger. |
| `components/ui/Reveal.test.tsx` | Content visible under reduced-motion and normally; `delay` forwarded into the transition. |
| `components/ui/SectionHeading.tsx` | Server. §8.3 divider: `border-t border-line` hairline, then `<Mark>` + mono uppercase label, then the heading (`h2`/`h3`) in the display face. |
| `components/ui/SectionHeading.test.tsx` | Renders label, heading at the requested level with its `id`, and a mark svg. |
| `components/home/Thesis.tsx` | Server. One large display sentence in the reading spine, wrapped in `<Reveal>`. Not a heading — a `<section aria-label>` landmark with a `<p>`. |
| `components/home/Thesis.test.tsx` | Renders the sentence. |
| `components/home/DesignAutomationSplit.tsx` | Server. `<SectionHeading label="What we do">` + two hairline-divided `<Link>` panels → `/lab`, `/automation`, each staggered; hover/focus lift + arrow colour (transition-only, so reduced-motion is unaffected). |
| `components/home/DesignAutomationSplit.test.tsx` | Both panels link to the right hrefs and carry their copy. |
| `components/home/HowWeBuild.tsx` | Server. `<SectionHeading label="How we build">` + 2×2 list of `<Mark>` + term + line (§10.4 verbatim) + a mono row of external links (headers scan now; Lighthouse report gated on `LIGHTHOUSE_URL`, `TODO(lhci-report-url)`). |
| `components/home/HowWeBuild.test.tsx` | Four pillars + copy; headers-scan link is `target="_blank" rel~="noopener"`. |
| `components/home/ContactBand.tsx` | Server. Full-bleed `bg-surface` band, inner `max-w-4xl` centred: `<h2>` + line + a solid `bg-accent` `<Link href="/contact">` — the page's one saturated element. |
| `components/home/ContactBand.test.tsx` | Heading present; CTA links to `/contact`; button carries the accent + `on-accent` classes. |
| `lighthouserc.json` | LHCI config: collect 3 runs against `npm run start` on `/`, assert LCP/CLS/TBT + category scores, upload to `temporary-public-storage`. |
| `e2e/home.spec.ts` | One `<h1>`, ≥3 `<h2>` in order; split panels navigate to `/lab` & `/automation`; contact CTA → `/contact`; 320 px no horizontal scroll; `prefers-reduced-motion` → zero `<canvas>` and every section visible; axe clean on `/`. |
| `e2e/home.visual.spec.ts` | Deterministic full-page screenshot of `/` at 1280 px and 390 px, shard latched to poster. |

**Modified:**

| Path | Change |
|---|---|
| `package.json` / `package-lock.json` | add `framer-motion` (dep), `@lhci/cli` (devDep), `"lhci": "lhci autorun"` script. |
| `app/globals.css` | add `--on-accent` to the three token blocks (`:root`, the dark `@media`, `:root[data-theme="dark"]`). |
| `tailwind.config.ts` | add `"on-accent": "var(--on-accent)"` to `theme.extend.colors`. |
| `app/page.tsx` | import + render the four new sections after `<Hero />` (grown one section per task). |
| `components/hero/Hero.tsx` | wrap eyebrow / `<h1>` / lede in a mount-gated rise with staggered `transition-delay`; skip under reduced-motion. |
| `components/effects/HeroShard.tsx` | wrap `<Canvas>` in a `transition-opacity` div that goes `0 → 1` one frame after mount (immediately if `reduced`). |
| `components/ui/Nav.tsx` | prepend `<Mark gradient />` to the wordmark; ramp `<LiquidGlass intensity>` from `0.32 → 0.6` one frame after mount (start at `0.6` if reduced-motion). |
| `components/ui/LiquidGlass.tsx` | add `transition: backdrop-filter .5s ease, background .5s ease` to the inline style so the intensity ramp animates. |
| `components/ui/Nav.test.tsx` | assert the wordmark link contains an svg (the mark). |
| `.github/workflows/ci.yml` | add a "Lighthouse budget" step after the e2e step. |

**Not in this plan (Phase 3+):** the Work teaser, the Lab teaser, the `content/` model (`work.ts` / `lab.ts` / `automation.ts` + zod), `/work` `/lab` `/automation` `/contact` page bodies, `api/contact`, security headers/CSP, the real brand SVG (`TODO(brand-svg)`), a permanent Lighthouse-report host.

---

## Task 1: Shared kit — `<Mark>`, `<Reveal>`, `<SectionHeading>`

**Files:**
- Create: `components/ui/Mark.tsx`, `components/ui/Mark.test.tsx`, `components/ui/Reveal.tsx`, `components/ui/Reveal.test.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/SectionHeading.test.tsx`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces:
  - `<Mark className?={string} gradient?={boolean} />` — inline SVG, `aria-hidden`. `gradient` → stroke is `url(#bv-mark-grad)` over a `<linearGradient>` `#1E3A8A→#3B82F6`; otherwise `currentColor`.
  - `<Reveal delay?={number} className?={string}>{children}</Reveal>` — client. Renders `<div className={className}>{children}</div>` before mount and whenever `useReducedMotion()` is true; otherwise a `motion.div` with `initial={{opacity:0,y:14}}`, `whileInView={{opacity:1,y:0}}`, `viewport={{once:true, margin:"0px 0px -10% 0px"}}`, `transition={{duration:0.5, delay, ease:[0.22,0.61,0.36,1]}}`.
  - `<SectionHeading label={string} as?={"h2"|"h3"} id?={string}>{children}</SectionHeading>` — server. Hairline + `<Mark>` + mono label + heading.

- [ ] **Step 1: Create the branch and install framer-motion**

```bash
cd portfolio-site
git checkout -b build/home
npm install framer-motion
```

Expected: `framer-motion` appears under `dependencies` in `package.json`; lockfile updated.

- [ ] **Step 2: Write the failing test for `<Mark>`**

Create `components/ui/Mark.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { Mark } from "./Mark";

test("renders an svg path, currentColor stroke by default, no gradient", () => {
  const { container } = render(<Mark className="x" />);
  const svg = container.querySelector("svg");
  expect(svg).toHaveClass("x");
  expect(svg).toHaveAttribute("stroke", "currentColor");
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector("path")).not.toBeNull();
  expect(container.querySelector("linearGradient")).toBeNull();
});

test("gradient variant strokes with a url(#…) over a linearGradient", () => {
  const { container } = render(<Mark gradient />);
  expect(container.querySelector("svg")?.getAttribute("stroke")).toMatch(/^url\(#/);
  expect(container.querySelector("linearGradient")).not.toBeNull();
});
```

- [ ] **Step 3: Run it — expect FAIL**

Run: `npm test -- Mark`
Expected: FAIL — `Cannot find module './Mark'`.

- [ ] **Step 4: Implement `components/ui/Mark.tsx`**

```tsx
type Props = {
  className?: string;
  /** Paint with `--brand-grad` instead of `currentColor` (nav wordmark only). */
  gradient?: boolean;
};

/**
 * The BridVance V/checkmark motif (§8.3): section-divider mark, "how we build"
 * step markers, and the nav wordmark glyph. `currentColor` by default; the
 * `gradient` variant paints `--brand-grad`. Placeholder geometry until the real
 * brand SVG lands — TODO(brand-svg).
 */
export function Mark({ className, gradient = false }: Props) {
  // Static id: only the nav wordmark uses `gradient`, and only once per page.
  const gradId = "bv-mark-grad";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={gradient ? `url(#${gradId})` : "currentColor"}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      )}
      {/* advance + verify: a tick that overshoots into a rising stroke */}
      <path d="M3.5 13l5.5 5.5L20.5 4.5" />
    </svg>
  );
}
```

- [ ] **Step 5: Run the `<Mark>` tests — expect PASS**

Run: `npm test -- Mark`

- [ ] **Step 6: Write the failing test for `<Reveal>`**

Create `components/ui/Reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

let reduce = false;
let lastProps: Record<string, unknown> | null = null;

vi.mock("framer-motion", () => ({
  useReducedMotion: () => reduce,
  motion: {
    div: (props: Record<string, unknown>) => {
      lastProps = props;
      const { initial, whileInView, viewport, transition, ...rest } = props;
      return <div {...(rest as Record<string, unknown>)} />;
    },
  },
}));

import { Reveal } from "./Reveal";

beforeEach(() => {
  reduce = false;
  lastProps = null;
});

test("renders children (visible) under reduced motion, no motion wrapper", () => {
  reduce = true;
  render(
    <Reveal>
      <p>alpha</p>
    </Reveal>
  );
  expect(screen.getByText("alpha")).toBeVisible();
  expect(lastProps).toBeNull();
});

test("animates once mounted and forwards `delay` into the transition", async () => {
  render(
    <Reveal delay={0.24}>
      <p>beta</p>
    </Reveal>
  );
  expect(await screen.findByText("beta")).toBeVisible();
  expect((lastProps?.transition as { delay?: number })?.delay).toBe(0.24);
});
```

- [ ] **Step 7: Run it — expect FAIL** (`Cannot find module './Reveal'`).

- [ ] **Step 8: Implement `components/ui/Reveal.tsx`**

```tsx
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
```

- [ ] **Step 9: Run the `<Reveal>` tests — expect PASS.**

- [ ] **Step 10: Write the failing test for `<SectionHeading>`**

Create `components/ui/SectionHeading.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./SectionHeading";

test("renders the mono label, a mark svg, and the heading at the given level + id", () => {
  const { container } = render(
    <SectionHeading label="What we do" as="h2" id="what">
      Two halves of one studio
    </SectionHeading>
  );
  expect(screen.getByText("What we do")).toBeInTheDocument();
  expect(container.querySelector("svg")).not.toBeNull();
  const h = screen.getByRole("heading", { level: 2, name: "Two halves of one studio" });
  expect(h).toHaveAttribute("id", "what");
});

test("defaults to h2, honours as='h3'", () => {
  render(<SectionHeading label="x" as="h3">Sub</SectionHeading>);
  expect(screen.getByRole("heading", { level: 3, name: "Sub" })).toBeInTheDocument();
});
```

- [ ] **Step 11: Run it — expect FAIL.**

- [ ] **Step 12: Implement `components/ui/SectionHeading.tsx`**

```tsx
import type { ReactNode } from "react";
import { Mark } from "./Mark";

type Props = {
  label: string;
  children: ReactNode;
  as?: "h2" | "h3";
  id?: string;
};

/**
 * Section opener (§8.3): a hairline, then the checkmark mark + a mono uppercase
 * label, then the heading in the display face. The label names a real section —
 * not decoration.
 */
export function SectionHeading({ label, children, as: Tag = "h2", id }: Props) {
  return (
    <div className="border-t border-line pt-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
        <Mark className="h-3.5 w-3.5 text-accent" />
        {label}
      </p>
      <Tag id={id} className="mt-3 text-2xl font-medium md:text-3xl">
        {children}
      </Tag>
    </div>
  );
}
```

- [ ] **Step 13: Run the `<SectionHeading>` tests — expect PASS.**

- [ ] **Step 14: Full unit suite + typecheck + lint**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all green (existing 28 tests + the new ones).

- [ ] **Step 15: Commit**

```bash
git add components/ui/Mark.tsx components/ui/Mark.test.tsx \
  components/ui/Reveal.tsx components/ui/Reveal.test.tsx \
  components/ui/SectionHeading.tsx components/ui/SectionHeading.test.tsx \
  package.json package-lock.json
git commit -m "feat: home kit — Mark motif, Reveal (motion + reduced-motion), SectionHeading"
```

---

## Task 2: `<Thesis>` + mount it

**Files:**
- Create: `components/home/Thesis.tsx`, `components/home/Thesis.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<Reveal>` from `components/ui/Reveal.tsx`.
- Produces: `<Thesis />` — no props.

- [ ] **Step 1: Write the failing test**

Create `components/home/Thesis.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { Thesis } from "./Thesis";

test("states the studio thesis in one sentence, inside a named landmark", () => {
  render(<Thesis />);
  expect(
    screen.getByText(
      /we design the surface people touch, and build the automation running behind it\./i
    )
  ).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /what bridvance does/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it — expect FAIL.**

- [ ] **Step 3: Implement `components/home/Thesis.tsx`**

```tsx
import { Reveal } from "@/components/ui/Reveal";

/** The studio's one-line claim (§5.1) — sets up the design ↔ automation split. */
export function Thesis() {
  return (
    <section
      aria-label="What BridVance does"
      className="mx-auto max-w-3xl px-4 py-24 md:py-32"
    >
      <Reveal>
        <p className="text-pretty text-2xl font-medium leading-snug text-fg md:text-4xl md:leading-tight">
          We design the surface people touch, and build the automation running
          behind it.
        </p>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 4: Run the test — expect PASS.**

- [ ] **Step 5: Mount it in `app/page.tsx`**

Edit `app/page.tsx` — add the import and render `<Thesis />` after `<Hero />`, wrapping both in a fragment:

```tsx
import { pageMetadataHome } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { Thesis } from "@/components/home/Thesis";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — design & agentic automation",
  description:
    "A studio building distinctive web front-ends and agentic automation systems.",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Thesis />
    </>
  );
}
```

- [ ] **Step 6: Build + bundle assertion**

Run: `export SITE_URL="https://bridvance.vercel.app" && npm run build && npm run assert:bundle`
Expected: build OK; `assert-bundle: OK — … no three.js`; `/` still `○ (Static)`.

- [ ] **Step 7: Commit**

```bash
git add components/home/Thesis.tsx components/home/Thesis.test.tsx app/page.tsx
git commit -m "feat: home thesis line"
```

---

## Task 3: `<DesignAutomationSplit>` + mount it

**Files:**
- Create: `components/home/DesignAutomationSplit.tsx`, `components/home/DesignAutomationSplit.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<Reveal>`, `<SectionHeading>`, `next/link`.
- Produces: `<DesignAutomationSplit />` — no props.

- [ ] **Step 1: Write the failing test**

Create `components/home/DesignAutomationSplit.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { DesignAutomationSplit } from "./DesignAutomationSplit";

test("links the design panel to /lab and the automation panel to /automation", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByRole("link", { name: /see the lab/i })).toHaveAttribute("href", "/lab");
  expect(screen.getByRole("link", { name: /see automation/i })).toHaveAttribute(
    "href",
    "/automation"
  );
});

test("carries each panel's heading and description", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByText(/interfaces worth looking at/i)).toBeInTheDocument();
  expect(screen.getByText(/systems that run the busywork/i)).toBeInTheDocument();
  expect(screen.getByText(/perform on a mid-range phone/i)).toBeInTheDocument();
  expect(screen.getByText(/book the appointment, chase the follow-up/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it — expect FAIL.**

- [ ] **Step 3: Implement `components/home/DesignAutomationSplit.tsx`**

```tsx
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PANELS = [
  {
    href: "/lab",
    label: "Design",
    heading: "Interfaces worth looking at",
    line: "Shader work, custom WebGL, kinetic type — built to perform on a mid-range phone, not just a demo reel.",
    cta: "See the Lab",
  },
  {
    href: "/automation",
    label: "Automation",
    heading: "Systems that run the busywork",
    line: "Agents that talk to customers, book the appointment, chase the follow-up — on the WhatsApp, calendar and CRM a business already uses.",
    cta: "See automation",
  },
] as const;

/** The design ↔ automation split (§5.1): one panel per half of the studio. */
export function DesignAutomationSplit() {
  return (
    <section
      aria-labelledby="what-we-do"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="What we do" id="what-we-do">
        Two halves of one studio
      </SectionHeading>

      <div className="mt-10 grid divide-y divide-line border-y border-line md:grid-cols-2 md:divide-x md:divide-y-0">
        {PANELS.map((panel, i) => (
          <Reveal key={panel.href} delay={i * 0.08}>
            <Link
              href={panel.href}
              className="group flex h-full flex-col gap-3 p-8 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 md:p-12"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {panel.label}
              </span>
              <span className="text-xl font-medium md:text-2xl">{panel.heading}</span>
              <span className="max-w-[46ch] font-body text-muted">{panel.line}</span>
              <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-fg transition-colors group-hover:text-accent group-focus-visible:text-accent">
                {panel.cta}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test — expect PASS.**

- [ ] **Step 5: Mount it in `app/page.tsx`**

Add the import and render `<DesignAutomationSplit />` after `<Thesis />`.

- [ ] **Step 6: Build + bundle assertion**

Run: `export SITE_URL="https://bridvance.vercel.app" && npm run build && npm run assert:bundle`
Expected: green.

- [ ] **Step 7: Commit**

```bash
git add components/home/DesignAutomationSplit.tsx components/home/DesignAutomationSplit.test.tsx app/page.tsx
git commit -m "feat: home design↔automation split panels"
```

---

## Task 4: `<HowWeBuild>` + mount it

**Files:**
- Create: `components/home/HowWeBuild.tsx`, `components/home/HowWeBuild.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<Reveal>`, `<SectionHeading>`, `<Mark>`.
- Produces: `<HowWeBuild />` — no props.

- [ ] **Step 1: Write the failing test**

Create `components/home/HowWeBuild.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { HowWeBuild } from "./HowWeBuild";

test("renders all four pillars with their one-line copy", () => {
  render(<HowWeBuild />);
  for (const term of ["Craft", "Performance", "Accessible", "Secure"]) {
    expect(screen.getByText(term)).toBeInTheDocument();
  }
  expect(screen.getByText(/distinctive design, not templates\./i)).toBeInTheDocument();
  expect(screen.getByText(/fast on a mid-range phone/i)).toBeInTheDocument();
  expect(screen.getByText(/keyboard, contrast, reduced-motion/i)).toBeInTheDocument();
  expect(screen.getByText(/hardened headers, validated inputs/i)).toBeInTheDocument();
});

test("the security-headers scan opens in a new tab with rel=noopener", () => {
  render(<HowWeBuild />);
  const scan = screen.getByRole("link", { name: /security headers scan/i });
  expect(scan).toHaveAttribute("target", "_blank");
  expect(scan.getAttribute("rel") ?? "").toContain("noopener");
});
```

- [ ] **Step 2: Run it — expect FAIL.**

- [ ] **Step 3: Implement `components/home/HowWeBuild.tsx`**

```tsx
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Mark } from "@/components/ui/Mark";

const PILLARS = [
  { term: "Craft", line: "Distinctive design, not templates." },
  {
    term: "Performance",
    line: "Fast on a mid-range phone, not just a desktop demo.",
  },
  {
    term: "Accessible",
    line: "Keyboard, contrast, reduced-motion as a baseline.",
  },
  {
    term: "Secure",
    line: "Hardened headers, validated inputs, dependency hygiene, no data we don't need.",
  },
] as const;

// TODO(lhci-report-url): set to the permanent Lighthouse report URL once the
// LHCI upload target is stable; until then the link is not rendered.
const LIGHTHOUSE_URL = "";
const HEADERS_SCAN_URL =
  "https://securityheaders.com/?q=https%3A%2F%2Fbridvance.vercel.app&followRedirects=on";

/** The four-pillar "how we build" band (§10.4) — positioning that is verifiable. */
export function HowWeBuild() {
  return (
    <section
      aria-labelledby="how-we-build"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-32"
    >
      <SectionHeading label="How we build" id="how-we-build">
        Non-negotiables
      </SectionHeading>

      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {PILLARS.map((pillar, i) => (
          <li key={pillar.term}>
            <Reveal delay={i * 0.06} className="flex gap-3">
              <Mark className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
                  {pillar.term}
                </p>
                <p className="mt-1 font-body text-muted">{pillar.line}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
        {LIGHTHOUSE_URL ? (
          <a
            href={LIGHTHOUSE_URL}
            target="_blank"
            rel="noopener"
            className="hover:text-fg"
          >
            Lighthouse report &#8599;
          </a>
        ) : null}
        <a
          href={HEADERS_SCAN_URL}
          target="_blank"
          rel="noopener"
          className="hover:text-fg"
        >
          Security headers scan &#8599;
        </a>
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Run the test — expect PASS.**

- [ ] **Step 5: Mount it in `app/page.tsx`** — render `<HowWeBuild />` after `<DesignAutomationSplit />`.

- [ ] **Step 6: Build + bundle assertion**

Run: `export SITE_URL="https://bridvance.vercel.app" && npm run build && npm run assert:bundle`

- [ ] **Step 7: Commit**

```bash
git add components/home/HowWeBuild.tsx components/home/HowWeBuild.test.tsx app/page.tsx
git commit -m "feat: home 'how we build' four-pillar band"
```

---

## Task 5: `<ContactBand>` + `--on-accent` token + mount it

**Files:**
- Create: `components/home/ContactBand.tsx`, `components/home/ContactBand.test.tsx`
- Modify: `app/globals.css`, `tailwind.config.ts`, `app/page.tsx`

**Interfaces:**
- Consumes: `<Reveal>`, `next/link`.
- Produces: `<ContactBand />` — no props. Adds Tailwind colour `on-accent` → `var(--on-accent)`.

**Why `--on-accent`:** white on the dark-theme `--accent` (`#3B82F6`) is only ~3.5:1 — below AA. `--on-accent` is `#FFFFFF` in light (7:1 on `#1D4ED8`) and `#0A1220` in dark (~5.3:1 on `#3B82F6`). The button's focus ring also switches to `--on-accent` so it stays visible against the accent fill.

- [ ] **Step 1: Add `--on-accent` to the three token blocks in `app/globals.css`**

In the bare `:root` block, add after `--accent-strong`:

```css
  --on-accent: #ffffff;
```

In **both** dark blocks — `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and `:root[data-theme="dark"] { … }` — add after `--accent-strong`:

```css
    --on-accent: #0a1220;
```

- [ ] **Step 2: Register the colour in `tailwind.config.ts`**

In `theme.extend.colors`, add:

```ts
        "on-accent": "var(--on-accent)",
```

- [ ] **Step 3: Write the failing test**

Create `components/home/ContactBand.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import { ContactBand } from "./ContactBand";

test("prompts for a project and links the CTA to /contact", () => {
  render(<ContactBand />);
  expect(
    screen.getByRole("heading", { level: 2, name: /have something in mind\?/i })
  ).toBeInTheDocument();
  const cta = screen.getByRole("link", { name: /start a project/i });
  expect(cta).toHaveAttribute("href", "/contact");
  expect(cta.className).toMatch(/\bbg-accent\b/);
  expect(cta.className).toMatch(/\btext-on-accent\b/);
});
```

- [ ] **Step 4: Run it — expect FAIL.**

- [ ] **Step 5: Implement `components/home/ContactBand.tsx`**

```tsx
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/** Closing call to action (§5.1). The button is the page's one solid `--accent`. */
export function ContactBand() {
  return (
    <section
      aria-labelledby="contact-band"
      className="border-t border-line bg-surface"
    >
      <Reveal className="mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <h2 id="contact-band" className="text-2xl font-medium md:text-4xl">
          Have something in mind?
        </h2>
        <p className="mx-auto mt-4 max-w-[48ch] font-body text-muted">
          Tell us what you&rsquo;re building &mdash; front-end, automation, or both.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-colors hover:bg-accent-strong focus-visible:bg-accent-strong focus-visible:[outline-color:var(--on-accent)]"
        >
          Start a project
        </Link>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 6: Run the test — expect PASS.**

- [ ] **Step 7: Mount it in `app/page.tsx`** — render `<ContactBand />` after `<HowWeBuild />`. Final file:

```tsx
import { pageMetadataHome } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { Thesis } from "@/components/home/Thesis";
import { DesignAutomationSplit } from "@/components/home/DesignAutomationSplit";
import { HowWeBuild } from "@/components/home/HowWeBuild";
import { ContactBand } from "@/components/home/ContactBand";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — design & agentic automation",
  description:
    "A studio building distinctive web front-ends and agentic automation systems.",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Thesis />
      <DesignAutomationSplit />
      <HowWeBuild />
      <ContactBand />
    </>
  );
}
```

- [ ] **Step 8: Full local verify (no e2e yet)**

Run:
```bash
export SITE_URL="https://bridvance.vercel.app"
npm run typecheck && npm run lint && npm run test && npm run build && npm run assert:bundle
```
Expected: all green; `/` still `○ (Static)`; First Load JS for `/` within a few KB of its pre-plan value (framer-motion adds to the page chunk, not shared — confirm `/` First Load is still well under 120 KB).

- [ ] **Step 9: Commit**

```bash
git add app/globals.css tailwind.config.ts components/home/ContactBand.tsx components/home/ContactBand.test.tsx app/page.tsx
git commit -m "feat: home contact band + --on-accent contrast token"
```

---

## Task 6: `e2e/home.spec.ts`

**Files:**
- Create: `e2e/home.spec.ts`

**Interfaces:**
- Consumes: the composed `/` from Tasks 2–5. No production code changes.

- [ ] **Step 1: Write the spec**

Create `e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("one h1, then the section h2s in order", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const h2s = await page.locator("h2").allInnerTexts();
  expect(h2s).toEqual([
    "Two halves of one studio",
    "Non-negotiables",
    "Have something in mind?",
  ]);
});

test("the split panels navigate to /lab and /automation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /see the lab/i }).click();
  await expect(page).toHaveURL(/\/lab$/);
  await page.goBack();
  await page.getByRole("link", { name: /see automation/i }).click();
  await expect(page).toHaveURL(/\/automation$/);
});

test("the contact CTA navigates to /contact", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start a project/i }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("reduced-motion: no canvas, every section visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText(/we design the surface people touch/i)).toBeVisible();
  await expect(page.getByText(/two halves of one studio/i)).toBeVisible();
  await expect(page.getByText(/non-negotiables/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /start a project/i })).toBeVisible();
});

test("axe: no serious or critical violations on /", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const bad = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical"
  );
  expect(bad).toEqual([]);
});
```

*(If `@axe-core/playwright` is already imported this way in `e2e/a11y.spec.ts`, mirror that file's exact import/usage instead — it is a Plan 1 dependency.)*

- [ ] **Step 2: Run it against the production build**

```bash
export SITE_URL="https://bridvance.vercel.app"
npm run build
CI=1 npx playwright test e2e/home.spec.ts --project=chromium-desktop --project=webkit-desktop --project=mobile-chrome --project=mobile-safari
```
Expected: all pass. `CI=1` makes the Playwright `webServer` run `npm run start` (production) instead of `npm run dev`.

- [ ] **Step 3: If the h2 ordering test fails**, read the actual `allInnerTexts()` output — a stray `<h2>` (e.g. a hero subhead) means the assertion list needs updating, not the components. The hero has an `<h1>` only; confirm no `<h2>` was introduced there.

- [ ] **Step 4: Commit**

```bash
git add e2e/home.spec.ts
git commit -m "test(e2e): home spine — headings, navigation, 320px, reduced-motion, axe"
```

---

## Task 7: Hero page-load choreography

**Files:**
- Modify: `components/hero/Hero.tsx`, `components/effects/HeroShard.tsx`, `components/ui/Nav.tsx`, `components/ui/LiquidGlass.tsx`
- Test: `e2e/home.spec.ts` (add one case)

**Interfaces:**
- Consumes: `useReducedMotion` from `framer-motion`.
- Produces: no new exported API. Behavioural: on first mount the hero text rises in (staggered), the shard canvas fades `0 → 1`, the nav glass ramps blur/saturate up. All three are skipped (final state immediate) under `prefers-reduced-motion`.

- [ ] **Step 1: Add the mount-gated rise to `components/hero/Hero.tsx`**

`Hero.tsx` is already `"use client"`. Add imports and a local helper, and wrap the eyebrow / `<h1>` / lede:

```tsx
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

// …inside Hero(), before the return:
const [lit, setLit] = useState(false);
const reduce = useReducedMotion();
useEffect(() => setLit(true), []);
const shown = lit || reduce;

function Line({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
    >
      {children}
    </div>
  );
}
```

Wrap the three text elements (keep their existing classes on the inner nodes):

```tsx
<Line delay={80}>
  <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
    BridVance
  </p>
</Line>
<Line delay={140}>
  <h1 className="mt-3 text-4xl font-medium md:text-6xl">
    Distinctive front-ends. Automation that actually runs.
  </h1>
</Line>
<Line delay={220}>
  <p className="mt-6 max-w-[52ch] font-body text-muted">
    A small studio building web experiences worth looking at, and agentic
    systems that handle the repetitive work behind them.
  </p>
</Line>
```

Note: `motion-reduce:transition-none` plus `shown` being `true` immediately under reduced-motion means no animation at all in that mode.

- [ ] **Step 2: Fade the shard up in `components/effects/HeroShard.tsx`**

`HeroShard()` already computes `reduced`. Add a raf-gated `up` flag and wrap the `<Canvas>`:

```tsx
const [up, setUp] = useState(false);
useEffect(() => {
  const id = requestAnimationFrame(() => setUp(true));
  return () => cancelAnimationFrame(id);
}, []);
```

Change the returned wrapper:

```tsx
return (
  <div
    className="h-full w-full transition-opacity duration-700 ease-out motion-reduce:transition-none"
    style={{ opacity: up || reduced ? 1 : 0 }}
    aria-hidden
  >
    <Canvas /* …unchanged props… */>
      <Shard detail={high ? 1 : 0} reduced={reduced} />
    </Canvas>
  </div>
);
```

(The `aria-hidden` moves to this wrapper; drop it from where it currently sits if duplicated.)

- [ ] **Step 3: Ramp the nav glass in `components/ui/Nav.tsx`**

`Nav.tsx` is `"use client"`. Add:

```tsx
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// inside Nav():
const reduce = useReducedMotion();
const [set, setSet] = useState(false);
useEffect(() => setSet(true), []);
const intensity = reduce || set ? 0.6 : 0.32;
```

Pass it: `<LiquidGlass as="header" intensity={intensity} className="sticky top-0 z-40">`.

- [ ] **Step 4: Let `LiquidGlass` animate the ramp**

In `components/ui/LiquidGlass.tsx`, add a transition to the inline `style` object so the recomputed `filter` string eases:

```tsx
    style: {
      backdropFilter: filter,
      WebkitBackdropFilter: filter,
      background: "color-mix(in srgb, var(--surface) 62%, transparent)",
      transition:
        "backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease, background 0.5s ease",
    },
```

- [ ] **Step 5: Add the e2e case to `e2e/home.spec.ts`**

```ts
test("reduced-motion hero text is visible immediately on load", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /distinctive front-ends\. automation that actually runs\./i,
    })
  ).toBeVisible();
});
```

- [ ] **Step 6: Verify**

```bash
export SITE_URL="https://bridvance.vercel.app"
npm run typecheck && npm run lint && npm run test && npm run build && npm run assert:bundle
CI=1 npx playwright test e2e/home.spec.ts e2e/shell.spec.ts --project=chromium-desktop --project=webkit-desktop --project=mobile-chrome --project=mobile-safari
```
Expected: all green. `shell.spec.ts` (existing hero/nav tests) must still pass.

- [ ] **Step 7: Commit**

```bash
git add components/hero/Hero.tsx components/effects/HeroShard.tsx components/ui/Nav.tsx components/ui/LiquidGlass.tsx e2e/home.spec.ts
git commit -m "feat: hero page-load choreography — text rise, shard fade-up, nav glass set"
```

---

## Task 8: Brand mark in the nav wordmark

**Files:**
- Modify: `components/ui/Nav.tsx`, `components/ui/Nav.test.tsx`

**Interfaces:**
- Consumes: `<Mark>` from `components/ui/Mark.tsx`.
- Produces: no API change — the wordmark link now contains the mark glyph.

- [ ] **Step 1: Add the assertion to `components/ui/Nav.test.tsx`**

Append:

```tsx
test("the wordmark link carries the brand mark", () => {
  render(
    <ThemeProvider>
      <Nav />
    </ThemeProvider>
  );
  const wordmark = screen.getByRole("link", { name: /bridvance/i });
  expect(wordmark.querySelector("svg")).not.toBeNull();
});
```

- [ ] **Step 2: Run it — expect FAIL** (no svg in the wordmark yet).

- [ ] **Step 3: Update the wordmark in `components/ui/Nav.tsx`**

```tsx
import { Mark } from "./Mark";

// …the wordmark link:
<Link
  href="/"
  className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
>
  <Mark gradient className="h-5 w-5" />
  BridVance
</Link>
```

- [ ] **Step 4: Run the Nav tests — expect PASS** (new + existing).

- [ ] **Step 5: Verify + commit**

```bash
npm run typecheck && npm run lint && npm run test
git add components/ui/Nav.tsx components/ui/Nav.test.tsx
git commit -m "feat: brand mark in the nav wordmark (placeholder glyph, TODO(brand-svg))"
```

---

## Task 9: `@lhci/cli` budget gate

**Files:**
- Create: `lighthouserc.json`
- Modify: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `npm run lhci` (`lhci autorun`). CI gains a "Lighthouse budget" step after e2e.

- [ ] **Step 1: Install**

```bash
npm install -D @lhci/cli
npm pkg set scripts.lhci="lhci autorun"
```

- [ ] **Step 2: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.02 }],
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 200 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Rationale: CLS and the a11y / best-practices scores are stable and under our control → hard `error` (the real blocking gate). LCP / TBT / perf-score vary with CI-runner load → `warn` for now. **TODO(lhci-promote):** promote LCP + TBT + `categories:performance` to `error` once three consecutive PRs show them green, and tighten `maxNumericValue` toward the §10.1 targets. Lighthouse's default profile is emulated mobile + slow 4G, which matches §10.1.

- [ ] **Step 3: Baseline it locally** (the dev machine has Chrome)

```bash
export SITE_URL="https://bridvance.vercel.app"
npm run build
npm run lhci
```
Expected: the run completes; prints an assertion summary and a `temporary-public-storage` report URL. If `error` assertions fail on the dev machine, the page has a real regression — fix it, do not loosen the threshold. If only `warn` lines appear, that is expected for now.

- [ ] **Step 4: Add the CI step to `.github/workflows/ci.yml`**

Insert **after** the `- run: npm run e2e` step (and its `env:` block) and **before** the `upload-artifact` step:

```yaml
      - name: Lighthouse budget
        env:
          SITE_URL: "https://bridvance.example"
        run: |
          export CHROME_PATH="$(node -e "console.log(require('playwright-core').chromium.executablePath())")"
          npm run lhci
```

`playwright-core` is already installed (via `@playwright/test`) and its bundled Chromium was fetched by the earlier `npx playwright install --with-deps` step, so `CHROME_PATH` resolves to a working binary. **Fallback:** if the runner still cannot find Chrome, add `- uses: browser-actions/setup-chrome@v1` immediately before this step and drop the `export CHROME_PATH=…` line.

- [ ] **Step 5: Commit**

```bash
git add lighthouserc.json package.json package-lock.json .github/workflows/ci.yml
git commit -m "ci: @lhci/cli budget gate (CLS + a11y hard, timing metrics warn-first)"
```

---

## Task 10: Visual snapshots, full verify, open the PR

**Files:**
- Create: `e2e/home.visual.spec.ts`, `e2e/home.visual.spec.ts-snapshots/` (generated baselines)

**Interfaces:**
- Consumes: the finished `/`. No production code.

- [ ] **Step 1: Write `e2e/home.visual.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

// Deterministic: latch the hero effect to its poster (no live canvas) and pin
// the light theme, so the snapshot is stable across runs and machines.
test.use({ colorScheme: "light" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("bv-fx-downgraded:/posters/hero-shard.svg", "1");
    } catch {}
  });
});

for (const width of [1280, 390] as const) {
  test(`home layout @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`home-${width}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
```

- [ ] **Step 2: Generate the baselines** (chromium-desktop only — one engine is enough for a layout snapshot)

```bash
export SITE_URL="https://bridvance.vercel.app"
npm run build
CI=1 npx playwright test e2e/home.visual.spec.ts --project=chromium-desktop --update-snapshots
```
Eyeball the two generated PNGs under `e2e/home.visual.spec.ts-snapshots/`. They must show the full page: hero → thesis → split → how-we-build → contact, poster (not canvas) in the hero.

- [ ] **Step 3: Re-run without `--update-snapshots` to confirm stability**

```bash
CI=1 npx playwright test e2e/home.visual.spec.ts --project=chromium-desktop
```
Expected: PASS (no diff).

- [ ] **Step 4: Full local verification**

```bash
export SITE_URL="https://bridvance.vercel.app"
npm run typecheck
npm run lint
npm run test
npm run build
npm run assert:bundle
CI=1 npx playwright test --project=chromium-desktop --project=webkit-desktop --project=mobile-chrome --project=mobile-safari
npm run lhci
```
Expected: typecheck/lint/test/build/assert all green; every Playwright project green; `lhci` completes (warn lines OK, no `error`). Note the `/` **First Load JS** from the build output — it must stay under ~120 KB gzip and `assert:bundle` must report no three.js.

- [ ] **Step 5: Commit the snapshots**

```bash
git add e2e/home.visual.spec.ts "e2e/home.visual.spec.ts-snapshots"
git commit -m "test(e2e): static home layout screenshot baselines (1280 / 390)"
```

- [ ] **Step 6: Push and open the PR**

```bash
git push -u origin build/home
```

Open a PR `build/home → main` titled **"Plan 2: Home page spine"**. Body: link this plan, list the sections added, note the spec was reconciled in `87b1d1d`, and call out the two deferred/soft items — `TODO(brand-svg)` (placeholder mark) and `TODO(lhci-report-url)` / `TODO(lhci-promote)` (timing metrics are `warn`). `gh` CLI is not installed on this machine — open the PR via the GitHub web UI, or `POST /repos/bridVance/portfolio/pulls` with a token from `git credential fill`.

- [ ] **Step 7: Watch CI**

The `verify` job runs typecheck → lint → unit → build → assert:bundle → e2e (5 browsers incl. Firefox) → **Lighthouse budget**. All must pass before merge. Vercel posts a Preview deployment status on the PR — open it and click through hero → thesis → split → bands, in both themes.

---

## Self-Review

**1. Spec coverage (Plan 2 scope):**

| Spec item | Task |
|---|---|
| §5.1 thesis line | Task 2 |
| §5.1 design↔automation split → `/lab`, `/automation` | Task 3 |
| §5.1 "how we build" band | Task 4 |
| §5.1 contact band → `/contact` | Task 5 |
| §5.1 / §8.4 orchestrated page-load (shard fade-up, headline settle, nav glass set); reduced-motion static | Task 7 |
| §8.3 section divider = hairline + mono label + checkmark mark | Task 1 (`SectionHeading`, `Mark`) |
| §8.3 checkmark motif as "how we build" step marker | Task 4 |
| §8.3 wordmark = mark + display face; mark carries `--brand-grad` | Tasks 1 + 8 |
| §8.4 scroll-reveal on section openers; reduced-motion → static | Task 1 (`Reveal`) + Tasks 2–5 |
| §10.1 perf budget / first-load JS excludes three | Tasks 2–5 build+assert:bundle steps; Task 9 (LHCI); Task 10 Step 4 |
| §10.2 one h1, heading order, axe clean, focus ring visible on the accent button | Task 5 (`--on-accent` ring), Task 6 (e2e) |
| §10.4 four pillars verbatim + Lighthouse/headers links | Task 4 |
| §11 `@lhci/cli` + budget gate lands with the hero + real content | Task 9 |
| §11 static-UI screenshot snapshots | Task 10 |
| §5.1 Work teaser / Lab teaser | **Deferred to Phase 3** (per brainstorming scope decision) — not a gap. |
| §7 `content/` model | **Deferred to Phase 3** — the spine renders no entry data. |

**2. Placeholder scan:** copy strings are real and verbatim-implementable (flagged as first-draft, user redlines in review). `LIGHTHOUSE_URL = ""` is a guarded empty value with a `TODO(lhci-report-url)` and the link is conditionally not rendered — not a broken placeholder. `TODO(lhci-promote)` and `TODO(brand-svg)` are tracked follow-ups, not plan gaps. No "TBD" / "add error handling" / "similar to Task N" anywhere; every code step has runnable code.

**3. Type / name consistency:** `<Mark className? gradient?>`, `<Reveal delay? className?>`, `<SectionHeading label as? id?>` are defined in Task 1 and consumed with those exact prop names in Tasks 2–5, 8. `--on-accent` / `on-accent` introduced in Task 5 and used only there. `useReducedMotion` imported from `framer-motion` in Tasks 1 and 7 consistently. The Playwright `CI=1` prefix (production `webServer`) is used consistently in Tasks 6, 7, 10. Section component names (`Thesis`, `DesignAutomationSplit`, `HowWeBuild`, `ContactBand`) match between their tasks and the `app/page.tsx` composition in Task 5 Step 7.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-04-portfolio-home.md`. Two execution options:

**1. Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — tasks run in this session via executing-plans, batch execution with checkpoints.

Which approach?
