# Studio Portfolio Site — Design Spec

**Date:** 2026-09-03
**Status:** Approved. Proceeding to implementation plan.
**Studio:** **BridVance** (slug `bridvance`)
**Path:** its own repo — `portfolio-site/` (may be renamed to `bridvance/`; cosmetic)

---

## 1. Overview

A portfolio site for a small (2–3 person) web studio, deployed to Vercel. It has two jobs:

1. **Prove design + front-end capability** — shader, 3D, and glass/optical work, shown both as site-level accent moments and as a dedicated interactive **Lab**.
2. **Sell agentic automation as a service** — vertical use-case "systems" (clinics, real estate, F&B, trading, D2C) with a consult / sample-request call to action. No automation case studies exist yet; this is a capability showcase.

**Audience:** founders / owners / marketing leads at consumer & trading SMEs in the UAE first, then UK and US. Also agencies (for subcontracting) and other founders.

**The site is its own strongest case study.** It must be fast on a mid-range phone, accessible, and secure — and say so, honestly, because that meets a real objection about hiring a small overseas team.

### Success criteria

- Lighthouse (mobile, throttled): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- All content and forms fully usable with **WebGL disabled** and with **JavaScript disabled** (SSG + progressive enhancement).
- Every effect degrades to a static poster on the low capability tier and under `prefers-reduced-motion`.
- Deployed to Vercel: `main` → production on the studio domain, PRs → preview URLs.
- v1 ships: 5 top-level routes (plus `/lab/[slug]` deep links), 6 Lab demos, 6 Work preview cards, 6 fully-built automation use-cases + an "also available" list, a working consult form.

---

## 2. Goals / non-goals (v1)

### In scope

- Routes: `/`, `/work`, `/lab`, `/lab/[slug]`, `/automation`, `/contact`.
- All pages statically rendered; content in typed TS data files (no CMS).
- 6 Lab demos (see §6).
- Work grid: 6 projects as **preview cards** (treated cover, name, one-liner, tags, status). Live projects link out; WIP projects show "Case study in progress" and do not link.
- Automation page: 6 fully-built vertical use-cases (Clinics ×3, Real estate ×3), each with an animated sample transcript and a consult CTA; the remaining systems render as a plain "also available" list.
- Consult / sample-request form → email (Resend) + optional single-row store.
- Dark-first theme with a working light theme; theme toggle.
- Cross-device capability tiers with runtime FPS guard.
- CI: typecheck, lint, unit + component + E2E, bundle-size assertion, Lighthouse budget gate.

### Out of scope (deferred, not designed away)

- Full `/work/[slug]` case-study pages — route and data shape are reserved; content is not ready.
- CMS / MDX authoring — data files only for now.
- Blog / writing section.
- Arabic / RTL / i18n — noted as a near-term follow-up for the UAE market; not v1.
- Real automation back-end / live agent demos — transcripts are scripted data.
- Auth, dashboards, client portal.

---

## 3. Inputs

**Resolved:**

- **Studio name:** BridVance.
- **Logo:** provided — a "BV" monogram, navy `B` fused with an electric-blue `V` that reads as a checkmark (advance + verify). Raster supplied; see below for the vector still needed.

**Still owed by the user:**

| Input | Blocks | Interim |
|---|---|---|
| **Logo as SVG** (plus a transparent PNG ≥ 1024px) | `liquid-logo` Lab demo (needs the mark as a clean texture), crisp wordmark, favicon, OG image | Build uses the supplied raster at `public/brand/`; demo 2 and favicon marked `TODO(brand-svg)` |
| **Studio domain** | Vercel domain, canonical URLs, `robots`/`sitemap` host | `sitemap.ts`/`robots.ts` read `SITE_URL` env; placeholder until set |
| **Contact destination email** | `api/contact` Resend "to" address | `CONTACT_TO` env; form returns success but mail is a no-op until set |
| Project cover assets / permission to link live URLs | `/work` card treatments, `liveUrl` fields | Cards render with a generated placeholder cover + `status: 'wip'` |

---

## 4. Architecture

### 4.1 Framework & hosting

- **Next.js (App Router)**, React 19, TypeScript.
- **Tailwind CSS v3** (matches the studio's other repos), PostCSS, autoprefixer.
- **framer-motion** for UI motion (already used across the studio's repos).
- Package manager: **npm** (matches other repos). Lockfile committed.
- Hosting: **Vercel**, Git integration. `main` = production, PRs = preview deploys (protected).
- Its **own repo**, sibling to the other project repos — not nested in an existing app.

### 4.2 Routes & file structure

```
app/
  layout.tsx            root: fonts (next/font), <ThemeProvider>, <GpuProvider>, <Nav>, <Footer>
  page.tsx              Home
  work/page.tsx         Work grid
  lab/page.tsx          Lab index (demo grid)
  lab/[slug]/page.tsx   Single demo (SSG shell, shareable deep link)
  automation/page.tsx   Automation use-cases + consult CTA
  contact/page.tsx      Consult / sample-request form
  api/contact/route.ts  POST handler: zod validate → rate limit → Turnstile → Resend → (optional) store
  robots.ts · sitemap.ts · opengraph-image.tsx
components/
  three/
    <Effect>.tsx        raw R3F / WebGL implementation
    <Effect>.client.tsx dynamic(ssr:false) + <Poster> loading + <EffectBoundary> + viewport gate
  lab/                  demo-specific components
  ui/                   Nav, Footer, Card, Button, SectionHeader, LiquidGlass, ThemeToggle, TranscriptPlayer
lib/
  gpu.ts               capability detection → useGpuTier(); runtime FPS sampler
  seo.ts               metadata helpers
  rate-limit.ts        Upstash wrapper
content/
  work.ts · lab.ts · automation.ts   typed data + zod schemas (validated in a unit test)
public/
  posters/             one static AVIF/WebP per effect, sized to final dimensions
  brand/               bridvance-logo.(svg|png), favicon, og  (raster in place; SVG pending — TODO(brand-svg))
```

### 4.3 Rendering / GPU island pattern

Every GPU effect follows exactly one pattern so they are independently understandable, testable, and non-fatal:

1. **`<Effect>.tsx`** — the raw R3F/WebGL component. Never imported at module top level from anywhere reachable by the shared bundle.
2. **`<Effect>.client.tsx`** wraps it with:
   - `next/dynamic(() => import('./<Effect>'), { ssr: false, loading: () => <Poster src=... /> })`
   - `<EffectBoundary>` (React error boundary) → renders the same `<Poster>` on any throw, plus a small mono note.
   - A **viewport gate** (IntersectionObserver hook): mounts the dynamic component only when within ~200px of viewport; unmounts when > ~1 viewport past.
3. **Poster**: a static AVIF/WebP at the effect's exact final dimensions (no layout shift). This is what SSR, no-JS, low-tier, and reduced-motion render.

`three` / `@react-three/fiber` reach the client **only** through these dynamic imports. A `@next/bundle-analyzer` assertion in CI fails the build if `three` appears in the shared/first-load JS. The Home hero is the one place `three` loads on a primary page (via `@shadergradient/react`), deferred until after first paint, poster underneath.

### 4.4 Cross-device capability tiers

`lib/gpu.ts` picks a tier at runtime:

| Tier | Trigger | Behaviour |
|---|---|---|
| **High** | WebGL2 + no `prefers-reduced-motion` + no `save-data` + `deviceMemory` unset or ≥ 8 | Full effects, DPR capped at 2 |
| **Mid** | WebGL2 but `deviceMemory` 4–8, or coarse pointer / small viewport | DPR ≤ 1.5, reduced canvas size, fewer draws/particles, target ≈ 40 fps, paused when offscreen |
| **Low** | no WebGL2, or `save-data`, or `deviceMemory` ≤ 4, or `prefers-reduced-motion`, or runtime FPS check fails | **Posters only** — no live effect mounts |

**Runtime FPS guard:** each effect samples frame time for ~2 s after mount; if median < threshold it swaps itself to its poster and writes a flag to `sessionStorage` so it will not retry that session.

**Mobile rules:** one live effect at a time (the hero on Home; on Lab, tap-to-run, one open, dismissible). All pointer interactions carry touch handlers and `touch-action`. Layouts down to 320 px. Posters reserve exact dimensions → zero CLS.

**Known browser gap:** `liquid-glass-js` uses SVG `feDisplacementMap` — a no-op in Firefox and inconsistent on older Safari. The `LiquidGlass` component feature-detects and falls back to `backdrop-filter: blur() saturate()`.

---

## 5. Pages

### 5.1 Home (`/`)

Full-bleed **hero** (`@shadergradient/react`, poster beneath until paint). Shader palette is tuned to **graphite / deep teal / faint warm spark — deliberately off the blue→purple axis** so it never dilutes BridVance blue into an ambient gradient (§8.1); the poster is a matching dark still, not a blue wash. Then a one-line **thesis** → the **design ↔ automation split** as two large panels linking to `/lab` and `/automation` → **Work teaser** (3 cards → `/work`) → **Lab teaser** (2 demo posters → `/lab`) → **"How we build" band** (§10.4) → **contact band** (→ `/contact`).

One orchestrated page-load: shader fades up from poster, headline settles on its weight axis, nav glass "sets". Reduced-motion: all static.

### 5.2 Work (`/work`)

Responsive grid, 6 cards. Card = treated cover (consistent crop + frame so the set reads as intentional pre-polish), project name, one-liner, role tags (Design / Build / E-commerce), status pill.
- `status: 'live'` → whole card links to `liveUrl` (new tab, `rel="noopener"`).
- `status: 'wip'` → "Case study in progress", not a link.
- Hover (High/Mid tier, fine pointer): slight scale + cover parallax. **One** featured card carries a `LiquidGlass` accent overlay; the rest do not.
- `/work/[slug]` reserved, not built in v1.

Projects: `al-marina-dates`, `cynosure`, `distributor-portal`, `ai-video-platform`, `bazaar-brief`, `mandap`.

### 5.3 Lab (`/lab`, `/lab/[slug]`)

Index: grid of demo cards (poster, title, one-line "what it shows", tech tags). Interaction:
- Desktop: card mounts its demo on scroll-into-view; max 2 live at once (a 3rd starting reverts the least-recent to poster).
- Mobile: poster + "Run" button; one live at a time; "Close" returns to poster.
- Click a card → focused view. Implemented with Next.js **intercepting + parallel routes** (`@modal/(.)lab/[slug]`): from `/lab` it opens as a modal over the grid; a direct hit on `/lab/[slug]` renders a standalone SSG page. Contents: live demo full-bleed, a short paragraph on the technique, any controls, a **"View source"** link.

`content/lab.ts` entry: `{ slug, title, blurb, tech: string[], poster, sourceUrl, component: () => Promise<Component> }`.

### 5.4 Automation (`/automation`)

Plain-language intro (systems that run one repetitive workflow end to end — talk to customers, book things, chase follow-ups — plugged into WhatsApp / Calendar / CRM the business already uses).

**Use-case cards, grouped by industry.** Each: **problem** (one sentence, business's side) → **what the agent does** (3–4 steps) → **plugs into** (chips) → **animated sample transcript** (`TranscriptPlayer` types out a scripted WhatsApp-style thread from data) → **CTA** ("Request a sample for your business" / "Book a 20-min consult" → `/contact` with `?topic=<slug>`).

Then a **"how we build it"** strip (discovery → paid sample on your data → deploy → monitor) and a prominent link to `/contact?topic=<slug>` (the form itself lives only on `/contact` — not embedded twice).

Menu — v1 fully builds the **6** systems in the Clinics and Real-estate rows; every other row renders as a plain "also available" list (adding or promoting one is a single data entry):

| Industry | Systems |
|---|---|
| Clinics & aesthetics | Appointment agent · No-show & recall agent · Review + digital-intake agent |
| Real estate | Instant lead qualifier + viewing booker · Listing copy & syndication assistant (EN/AR) · Buyer-match WhatsApp agent |
| F&B / restaurants | Reservation & waitlist agent · Google-review response drafter |
| Retail & trading / import-export | RFQ intake → draft quotation · "Where's my order" + supplier-chase agent |
| D2C / e-commerce | Support triage (FAQ / WISMO) · WhatsApp cart-recovery |

`content/automation.ts` entry: `{ industry, slug, title, problem, steps: string[], integrations: string[], sampleTranscript: { role: 'user' | 'agent' | 'system', text: string, delay: number }[], featured: boolean }`.

### 5.5 Contact (`/contact` + `api/contact`)

Form fields: name, business name, industry (select, matches the automation verticals + "other / design project"), what you need (textarea), website / social links (optional), email. Optional `topic` prefilled from query.

`api/contact` (POST): `zod` parse → Upstash rate limit (per IP, e.g. 5 / 10 min) → Cloudflare Turnstile verify → Resend send to the studio address → optional single-row store (Upstash / a lightweight KV). Honeypot field. No PII logged. Returns `{ ok: true }` / typed error. Client shows inline success/error, never a placeholder-as-label.

---

## 6. The Lab demos (v1)

Each shows a **distinct** capability, not a variation. Each uses the §4.3 island pattern with a poster.

| # | Demo | Built on | Shows | Fallback |
|---|---|---|---|---|
| 1 | **Shader gradient** | `@shadergradient/react` | Shader-driven ambient visuals; controls for colour / speed / grain. Doubles as "play with the hero tech." | Poster (CSS gradient still image) |
| 2 | **Liquid-metal logo** | port of `paper-design/liquid-logo` shader into `components/lab/LiquidLogo/` | Custom WebGL shader work on a real brand asset (the studio logo → texture); viscosity / refraction toggles | Static rendered image of the logo |
| 3 | **Liquid-glass lens** | `liquid-glass-js` wrapped as `components/ui/LiquidGlass.tsx` | SVG displacement / DOM-level optics; drag a refracting panel over page content | `backdrop-filter` blur+saturate panel |
| 4 | **Transmission glass object** | `@react-three/fiber` + `@react-three/drei` `MeshTransmissionMaterial` | Real three.js fluency — PBR transmission material, lighting, environment, drag-to-rotate | Poster (rendered still) |
| 5 | **Image-distortion grid** | custom GLSL + R3F | Shader + pointer/touch interaction — the "agency" ripple/melt reveal, done cleanly; tap on mobile | Plain image grid, CSS hover only |
| 6 | **Kinetic variable type** | CSS `font-variation-settings` + small JS scramble; **no WebGL** | Typography as motion; proves range beyond shaders; lowest risk | Static styled headline |

Deferred Lab idea: a seeded generative-canvas piece (flow field, export-to-PNG) for creative-coding range.

**`liquid-logo` note:** it is a repo/example, not an npm package. We port the fragment shader + a minimal texture loader as our own small component, credited, `sourceUrl` pointing to the upstream repo. Kept intentionally small; version of the reference pinned in a comment.

---

## 7. Content model

Three typed files in `content/`, each with a `zod` schema; a unit test asserts every entry parses and its `poster` file exists.

- `work.ts`: `{ slug, title, blurb, tags: string[], cover: string, liveUrl?: string, status: 'live' | 'wip', year: number }[]`
- `lab.ts`: `{ slug, title, blurb, tech: string[], poster: string, sourceUrl: string, load: () => Promise<{ default: ComponentType }> }[]`
- `automation.ts`: `{ industry, slug, title, problem, steps: string[], integrations: string[], sampleTranscript: TranscriptLine[], featured: boolean }[]`

No CMS. Moving to MDX/a CMS later does not change routing or components — only the data source.

---

## 8. Visual design system

**Concept:** near-monochrome navy chrome — precise, instrument-like — with **BridVance electric blue as the single point of saturation** anywhere on the site. The shader/3D work supplies texture and depth, not competing colour. Through-line: engineered surfaces (light through glass, metal flowing, systems underneath). The logo's `V`/checkmark reads as *advance + verify* and becomes a structural motif, not decoration.

### 8.1 Palette (brand-derived)

Dark (default):

| token | value | use |
|---|---|---|
| `--bg` | `#080B14` | page ground — navy-black (blue family, not neutral black) |
| `--surface` | `#0F1524` | cards, raised areas |
| `--surface-2` | `#161E33` | insets, nested raises |
| `--fg` | `#E8EBF2` | primary text (faint blue-cool white) |
| `--muted` | `#8791A8` | secondary text |
| `--line` | `#212A42` | hairlines, borders |
| `--accent` | `#3B82F6` | BridVance blue — links, focus ring, key CTAs, the one saturated element; used as a **solid**, sparingly |
| `--accent-strong` | `#4F8DFF` | hover / active state of `--accent` |
| `--brand-grad` | `linear-gradient(135deg,#1E3A8A,#3B82F6)` | **wordmark + liquid-metal demo only** — never a page/section background |
| `--status` | `#37E0A8` | "active / online" — automation transcripts, live dots; distinct from brand blue; rare |

Light: `--bg #F6F7FA`, `--surface #FFFFFF`, `--surface-2 #EEF1F7`, `--fg #0E1524`, `--muted #586079`, `--line #E2E5EE`, `--accent #1D4ED8`, `--accent-strong #2563EB`, `--status #0E9E76`.

Tokens on bare `:root` (light), redefined under `@media (prefers-color-scheme: dark)` guarded `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. `body` background is always an explicit token. Theme toggle persists to `localStorage` (guarded try/catch).

**Keeping it off the generic path:** a dark ground + one blue accent is close to a known template cluster. It stays deliberate here because the accent is the actual brand, the ground is navy not neutral-black, the blue *gradient* is reserved off all backgrounds, the hero shader is tuned **away from the blue→purple axis** (graphite / deep teal / faint warm spark) so BridVance blue is never diluted into an ambient gradient, and the checkmark motif does real structural work (§8.3).

### 8.2 Type (all self-hosted via `next/font/google`)

- **Familjen Grotesk** — display & UI. Characterful, under-used, tall x-height; warms the cold palette.
- **Newsreader** — reading text on Automation and Work prose. A literary body against machined headlines is the deliberate, non-templated move.
- **JetBrains Mono** — tags, "View source", sample transcripts, section labels.
- Modular scale ≈ 1.25 (mobile) / 1.333 (desktop). Headings `text-wrap: balance`. Uppercase labels get letter-spacing. `font-variant-numeric: tabular-nums` on any aligned figures.

### 8.3 Layout & signature

Precise single-column-with-wide-margins spine for reading; full-bleed for hero and Lab. Section dividers = one hairline + a mono label (labels only where they encode real structure, not decoration).

**Checkmark motif:** the logo's `V`/tick is the section-divider mark and the step marker on the "how we build" strips (§5.4, §10.4) — it encodes *forward / verified*, which is the studio's whole pitch. Not used as filler bullets or ornament.

**Wordmark:** the supplied mark + "BridVance" set in the display face (Familjen Grotesk, tight tracking); the mark carries `--brand-grad`, the text stays `--fg`.

**Signature element:** the **top nav is a real liquid-glass bar** (`LiquidGlass`) — the site using its own showcased tech as load-bearing chrome, refracting whatever scrolls beneath it; `backdrop-filter` fallback where `feDisplacementMap` is unsupported. Everything else stays quiet so this carries. Boldness is spent here and in the hero; nowhere else.

### 8.4 Motion

One orchestrated Home load (hero fade-up, headline weight-axis settle, nav glass set). Elsewhere restrained: scroll-reveal on section openers, card hover micro-states, the transcript typing. `prefers-reduced-motion` → everything static; shader renders one frozen frame.

### 8.5 Design exploration tooling — Kombai (ideation only)

Kombai (VS Code / Cursor extension) is used **only as a design-idea source**, on its own canvas, driven by the §8 brief: hero compositions, section rhythm, card treatments, type/spacing explorations.

- Output is **reference only** — the user reviews the variations and brings back screenshots / notes on what works.
- Kombai does **not** write into this repo. No Kombai-generated components are merged; no branch-per-run workflow.
- Usage stays minimal — a handful of canvas generations on the free tier.
- All components are built by Claude Code per this spec, informed by whichever compositions and treatments the user selects.

This keeps the GPU-island discipline, security middleware, and test/CI gates fully under one hand, and avoids any third-party code entering the bundle.

---

## 9. Dependencies

**Runtime:** `next`, `react`, `react-dom`, `@shadergradient/react` (+ peer `three`, `@react-three/fiber`), `@react-three/drei`, `liquid-glass-js`, `framer-motion`, `zod`, `resend`, `@upstash/redis`, `@upstash/ratelimit`, `clsx`, `tailwind-merge`.

**Dev:** `typescript`, `tailwindcss@3`, `postcss`, `autoprefixer`, `@next/bundle-analyzer`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `oxlint`, `@lhci/cli`.

All third-party effect code (`liquid-glass-js`, the ported `liquid-logo` shader) is version-pinned and fully bundled/self-hosted — **no runtime third-party fetches**. Renovate keeps deps current; `npm audit` runs in CI.

---

## 10. Standards

### 10.1 Performance budget

- LCP < 2.0 s on emulated 4G mobile; CLS ≈ 0; TBT < 200 ms.
- First-load JS (shared) < ~120 KB gzip, **excluding** dynamically-loaded `three`.
- `@next/bundle-analyzer` CI assertion: `three` / `@react-three/*` absent from first-load JS.
- `next/font` self-hosted (no Google CDN request, no shift). `next/image` AVIF/WebP; `priority` only on the hero poster. Posters sized exactly.

### 10.2 Accessibility (WCAG 2.2 AA)

Full keyboard nav; visible amber focus ring; skip link. Contrast verified for fg/bg and accent-on-surface in both themes. `prefers-reduced-motion` honoured everywhere. Canvases `aria-hidden`; nothing meaningful conveyed only through a shader. Forms: real `<label>`s, errors tied via `aria-describedby`, no placeholder-as-label. Semantic landmarks, one `h1` per page, logical heading order. Automated axe run in E2E.

### 10.3 Security (the site itself)

- Headers via middleware / `next.config`: strict `Content-Security-Policy` (`script-src 'self'` + per-request nonce, `frame-ancestors 'none'`, `connect-src 'self'` + the Turnstile endpoint; Resend and Upstash are called only from the server route handler and are not in the browser CSP), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geolocation.
- `api/contact`: server-side `zod` validation, per-IP rate limiting (Upstash), Cloudflare Turnstile verification, honeypot field, no PII in logs, delivery via Resend using server-only env vars; if stored, a single minimal row.
- No secrets client-side; all env vars server-only; `.env*` git-ignored; `.env.example` documents keys.
- Dependency hygiene: lockfile committed, `npm audit` gate, Renovate, third-party effect libs reviewed + pinned + bundled.
- Vercel: preview deployments protected; production HTTPS-only; no wildcard CORS.

### 10.4 On-site "How we build" band

A four-pillar strip on Home, linked from Work — one line each:

- **Craft** — distinctive design, not templates.
- **Performance** — fast on a mid-range phone, not just a desktop demo.
- **Accessible** — keyboard, contrast, reduced-motion as a baseline.
- **Secure** — hardened headers, validated inputs, dependency hygiene, no data we don't need. For automation projects this line also covers auth on agent endpoints, scoped API keys, and PII handling.

Links to this site's live Lighthouse report and a headers scan. It is positioning *and* verifiable — the site meets all four.

---

## 11. Testing

- **Unit (Vitest):** `lib/gpu.ts` tier selection + FPS-guard logic; `api/contact` `zod` schema; `content/*` integrity (every entry parses, referenced `poster` exists).
- **Component (Testing Library):** `Nav`, `Card` (live vs wip), `ThemeToggle`, form states (idle / submitting / success / error), `EffectBoundary` renders the poster when its child throws, `TranscriptPlayer` reveals lines in order.
- **E2E (Playwright), Section 4.4 matrix** (engine + device-descriptor emulation): WebKit + iPhone descriptor, Chromium + Pixel descriptor, desktop Chromium / Firefox / WebKit, plus a throttled low-memory profile. Routes render; consult form submits (network mocked); `prefers-reduced-motion` → posters, no canvas; forced low tier (stub `WebGL2RenderingContext`) → posters; keyboard traversal of nav + form; 320 px layout has no horizontal scroll; axe has no serious violations.
- **Effects:** not pixel-asserted. Assert each mounts without throwing in a WebGL-capable headless context and that stubbing WebGL off yields the poster.
- **Visual:** Playwright screenshot snapshots of the static (non-canvas) UI at 3 breakpoints.
- **CI (GitHub Actions or Vercel):** typecheck → `oxlint` → unit + component → Playwright (Chromium/WebKit/Firefox) → bundle-analyzer assertion → `@lhci/cli` budget gate. PR blocks on failure.

---

## 12. Deployment

- New repo, npm, committed lockfile.
- Vercel Git integration: `main` → production, PRs → protected preview URLs.
- Runtime services (free tiers): **Resend** (email), **Upstash Redis** (rate limit + optional store), **Cloudflare Turnstile** (bot check). Keys as Vercel env vars, documented in `.env.example`.
- Studio custom domain connected in Vercel; `sitemap.ts` / `robots.ts` use the canonical host.
- No server runtime beyond Next.js route handlers.

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `three` leaks into the shared bundle → slow first load | `@next/bundle-analyzer` CI assertion; all R3F reached only via `next/dynamic` |
| `shadergradient` janky on low-end phones | tier gate + runtime FPS guard + poster; hero `three` deferred past first paint |
| `liquid-glass-js` SVG filters break cross-browser (esp. Firefox) | feature-detect; `backdrop-filter` fallback baked into `LiquidGlass` |
| Ported `liquid-logo` shader becomes a maintenance burden | keep the port minimal, pin the reference commit in a comment, isolate in one folder |
| Case-study content not ready at launch | preview-card art direction designed to look intentional; `/work/[slug]` deferred |
| Logo vector (SVG) not yet supplied | raster used everywhere interim; `liquid-logo` demo + favicon marked `TODO(brand-svg)`, swapped in when the SVG lands — no structural change |
| Automation use-case scope creep | v1 ships 6–8; data-driven so more is a content entry, not a build |
| Effect libraries ship their own runtime fetches | reviewed at inclusion; anything with a runtime CDN call is bundled or dropped |

---

## 14. Future (post-v1, not designed here)

- Full `/work/[slug]` case-study pages as projects get polished.
- MDX or a lightweight CMS for Work + Automation content.
- Arabic / RTL and `hreflang` for the UAE market.
- More Lab demos (generative canvas, physics playground, WebGPU experiment).
- A real gated automation sandbox (book-a-demo that spins up a scoped agent).
- `/approach` or `/studio` page once there's a team story to tell.
