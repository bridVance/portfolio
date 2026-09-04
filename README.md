# BridVance

Studio portfolio. Next.js 15 (App Router, webpack) + React 19 + TypeScript +
Tailwind v3. Deploys on Vercel.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Verify (what CI runs)

```bash
npm run verify
```

`verify` chains, stopping at the first failure:

| step            | command                          | what it checks                                        |
| --------------- | -------------------------------- | ---------------------------------------------------- |
| `typecheck`     | `tsc --noEmit`                    | types                                               |
| `lint`          | `oxlint .`                        | correctness lint (`.oxlintrc.json`)                 |
| `test`          | `vitest run`                     | unit / component suite                             |
| `build`         | `next build`                     | production build + static prerender                |
| `assert:bundle` | `node scripts/assert-bundle.mjs` | fails if `three` / `@react-three` reaches a first-load chunk |
| `e2e`           | `playwright test`                | 5 projects: chromium / firefox / webkit desktop + Pixel 7 + iPhone 14 |

Playwright browsers are installed once with `npx playwright install chromium
firefox webkit` (no `--with-deps` locally — that flag is Ubuntu-only and lives in
`.github/workflows/ci.yml`). `firefox-desktop` may fail to launch on Windows if
Defender blocks the binary; CI (Linux) runs all five projects.

- `npm run e2e:visual` — opt-in home-layout screenshot check (chromium only; baselines are OS-specific, regenerate with `--update-snapshots`).

## Environment

Copy `.env.example` to `.env.local`. Only `SITE_URL` matters for this milestone —
it feeds `app/sitemap.ts`, `app/robots.ts`, and canonical URLs. The remaining
keys are placeholders for the Plan 4 contact form and can stay blank.

## Deploy (handoff)

Not yet connected to a remote. To ship:

1. Push this branch, open a PR into `main`, land it after CI is green.
2. Vercel → Import Project → pick the repo. Framework preset: Next.js
   (`vercel.json` pins `framework` + `buildCommand`).
3. Set `SITE_URL` (and later the form env vars) in Vercel → Project → Settings →
   Environment Variables.
4. Push to `main` → production deploy. Every PR → its own preview URL.
5. Confirm the preview renders all five routes (`/`, `/work`, `/lab`,
   `/automation`, `/contact`) and that `/robots.txt` + `/sitemap.xml` use the
   configured origin.
