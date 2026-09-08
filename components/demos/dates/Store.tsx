"use client";

import { useMemo, useState } from "react";

/**
 * Case study: a premium dates importer, retail and wholesale.
 *
 * Built to the design system ui-ux-pro-max returned for "premium dates dried
 * fruit gourmet retail": the Feature-Rich Showcase pattern (hero, variety
 * cards, use cases, proof, CTA), a Liquid Glass chrome, and its stone-and-gold
 * palette with Cormorant over Montserrat. The fonts and colours are the
 * skill's, not the studio's — which is the point of the exercise.
 *
 * Interaction is the weight selector: grade and pack size change the price, so
 * the card is a small working configurator rather than a static tile.
 */

const WEIGHTS = [
  { id: "250", label: "250g", factor: 1 },
  { id: "500", label: "500g", factor: 1.9 },
  { id: "1000", label: "1kg", factor: 3.6 },
] as const;

const VARIETIES = [
  { id: "medjool", name: "Medjool", origin: "Jordan Valley", note: "Large, caramel, soft skin", base: 640, tone: "#6B3F1D" },
  { id: "ajwa", name: "Ajwa", origin: "Madinah", note: "Dark, dry, faintly bitter", base: 1180, tone: "#332018" },
  { id: "sukkari", name: "Sukkari", origin: "Qassim", note: "Golden, crumbly, very sweet", base: 720, tone: "#A5761F" },
  { id: "khudri", name: "Khudri", origin: "Riyadh", note: "Firm, less sweet, everyday", base: 480, tone: "#5A3A22" },
  { id: "safawi", name: "Safawi", origin: "Madinah", note: "Semi-dry, deep, keeps well", base: 860, tone: "#2B1C15" },
  { id: "barhi", name: "Barhi", origin: "Basra", note: "Fresh, crisp, seasonal", base: 980, tone: "#B98A2E" },
] as const;

// Same five-per-line cap as the other storefront: these are graded by hand
// and a single order should not clear a variety.
const MAX_PER_LINE = 5;

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function Store() {
  const [weight, setWeight] = useState<string>("500");
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [sent, setSent] = useState(false);

  const [basketOpen, setBasketOpen] = useState(false);
  const factor = WEIGHTS.find((w) => w.id === weight)!.factor;

  // Keyed by variety *and* pack size: a 250g and a 1kg of the same date are
  // different lines at different prices, and collapsing them would quietly
  // charge the wrong amount.
  const lines = useMemo(
    () =>
      Object.entries(basket).flatMap(([key, qty]) => {
        const [id, w] = key.split("|");
        const v = VARIETIES.find((x) => x.id === id);
        const wt = WEIGHTS.find((x) => x.id === w);
        if (!v || !wt || qty <= 0) return [];
        const unit = v.base * wt.factor;
        return [{ key, name: v.name, size: wt.label, qty, unit, line: unit * qty }];
      }),
    [basket]
  );
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.line, 0);

  return (
    <div className="dates min-h-screen">
      <style>{`
        .dates {
          --ink: #0C0A09;
          --stone: #1C1917;
          --stone-2: #44403C;
          --gold: #A16207;
          --paper: #FAFAF9;
          --card: #FFFFFF;
          --line: #D6D3D1;
          --muted: #57534E;
          background: var(--paper);
          color: var(--ink);
        }
        .dates h1, .dates h2, .dates h3, .dates .display {
          font-family: var(--font-cormorant), Georgia, serif;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .dates, .dates button, .dates input, .dates select {
          font-family: var(--font-montserrat), system-ui, sans-serif;
        }
        /* Liquid Glass chrome, per the style the skill selected. */
        .dates .glass {
          background: color-mix(in srgb, var(--paper) 72%, transparent);
          backdrop-filter: blur(14px) saturate(1.3);
          -webkit-backdrop-filter: blur(14px) saturate(1.3);
        }
        .dates a:focus-visible, .dates button:focus-visible, .dates input:focus-visible {
          outline: 3px solid var(--gold); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .dates * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="glass sticky top-0 z-20 border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="display text-xl tracking-tight">Al Marina Dates</span>
          <nav aria-label="Store" className="hidden gap-6 text-sm sm:flex">
            <a href="#varieties" className="hover:text-[var(--gold)]">Varieties</a>
            <a href="#uses" className="hover:text-[var(--gold)]">Ways to use</a>
            <a href="#wholesale" className="hover:text-[var(--gold)]">Wholesale</a>
          </nav>
          <button
            type="button"
            onClick={() => setBasketOpen((v) => !v)}
            aria-expanded={basketOpen}
            aria-controls="dates-basket"
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-sm transition-colors hover:border-[var(--gold)]"
          >
            Basket · {count}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[var(--gold)]">
          Imported direct · Graded by hand
        </p>
        <h1 className="mx-auto mt-5 max-w-[16ch] text-4xl leading-[1.06] md:text-6xl">
          The date is the whole product. So we start there.
        </h1>
        <p className="mx-auto mt-5 max-w-[54ch] leading-relaxed text-[var(--muted)]">
          Six varieties, bought from growers we have used for eleven years,
          graded in Kochi and shipped within the week. No glucose coating, no
          fumigation, no filler in the box.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#varieties" className="rounded-full bg-[var(--stone)] px-7 py-3 text-sm text-white">
            Browse varieties
          </a>
          <a href="#wholesale" className="rounded-full border border-[var(--line)] px-7 py-3 text-sm">
            Wholesale pricing
          </a>
        </div>
      </section>

      <section id="varieties" className="mx-auto max-w-5xl px-4 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Six varieties</h2>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Prices shown for the selected pack size.
            </p>
          </div>
          <fieldset className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--card)] p-1">
            <legend className="sr-only">Pack size</legend>
            {WEIGHTS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWeight(w.id)}
                aria-pressed={weight === w.id}
                className={
                  weight === w.id
                    ? "rounded-full bg-[var(--stone)] px-4 py-1.5 text-sm text-white"
                    : "rounded-full px-4 py-1.5 text-sm text-[var(--muted)]"
                }
              >
                {w.label}
              </button>
            ))}
          </fieldset>
        </div>

        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VARIETIES.map((v) => (
            <li
              key={v.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)]"
            >
              <div
                aria-hidden
                className="flex h-36 items-center justify-center gap-1.5"
                style={{ background: `linear-gradient(155deg, ${v.tone}18, ${v.tone}38)` }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-12 w-7 rounded-[45%] shadow-sm"
                    style={{ background: v.tone, transform: `rotate(${(i - 1) * 12}deg)` }}
                  />
                ))}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xl">{v.name}</h3>
                  <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--gold)]">
                    {v.origin}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[var(--muted)]">{v.note}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-lg tabular-nums">{rupees(v.base * factor)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const key = `${v.id}|${weight}`;
                      setBasket((b) => ({
                        ...b,
                        [key]: Math.min((b[key] ?? 0) + 1, MAX_PER_LINE),
                      }));
                      setBasketOpen(true);
                    }}
                    className="rounded-full border border-[var(--stone)] px-4 py-2 text-sm transition-colors hover:bg-[var(--stone)] hover:text-white"
                  >
                    Add<span className="sr-only"> {v.name}, {WEIGHTS.find((w) => w.id === weight)!.label}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="uses" className="border-y border-[var(--line)] bg-[var(--card)] py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl">Ways people actually use them</h2>
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul role="list" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Ramadan boxes", "Ajwa and Safawi, packed in fifties for distribution."],
              ["Bakeries", "Medjool by the 5kg carton, pitted on request."],
              ["Gifting", "Mixed trays with a printed card, sent direct."],
              ["Everyday", "Khudri, because nobody needs Ajwa on a Tuesday."],
            ].map(([h, b]) => (
              <li key={h}>
                <h3 className="text-xl">{h}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="grid gap-6 text-center sm:grid-cols-3">
          {[
            ["11 years", "buying from the same growers"],
            ["4 days", "from grading to your door"],
            ["No coating", "nothing added to make them shine"],
          ].map(([n, l]) => (
            <li key={n}>
              <p className="display text-3xl text-[var(--gold)]">{n}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{l}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="wholesale" className="border-t border-[var(--line)] bg-[var(--stone)] py-16 text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl text-white">Buying by the carton?</h2>
            <p className="mt-3 max-w-[42ch] leading-relaxed text-white/70">
              Wholesale starts at 20kg per variety, with pricing that moves on
              volume and season. Tell us what you need and we will send a rate
              sheet the same day.
            </p>
          </div>
          {sent ? (
            <div className="rounded-2xl border border-white/20 p-6">
              <h3 className="text-2xl text-white">Enquiry noted</h3>
              <p className="mt-2 text-sm text-white/70">
                This is a portfolio demo, so nothing was sent and no details were
                stored.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 rounded-full border border-white/30 px-5 py-2 text-sm"
              >
                Reset
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex flex-col gap-3 rounded-2xl border border-white/20 p-6"
            >
              <label className="text-sm text-white/70" htmlFor="wh-name">
                Business name
              </label>
              <input
                id="wh-name"
                required
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40"
                placeholder="Kochi Bakehouse"
              />
              <label className="mt-1 text-sm text-white/70" htmlFor="wh-qty">
                Roughly how much, per month
              </label>
              <input
                id="wh-qty"
                required
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40"
                placeholder="80kg Medjool, 20kg Sukkari"
              />
              <button
                type="submit"
                className="mt-3 rounded-full bg-[var(--gold)] px-6 py-3 text-sm text-white"
              >
                Request a rate sheet
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-[var(--stone)] py-8 text-center text-white/50">
        <p className="text-[0.68rem] uppercase tracking-[0.2em]">
          Demo site · BridVance
        </p>
      </footer>

      <aside
        id="dates-basket"
        aria-label="Your basket"
        className={`glass fixed inset-y-0 right-0 z-30 w-full max-w-sm flex-col border-l border-[var(--line)] ${
          basketOpen ? "flex" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <h2 className="display text-xl">Your basket</h2>
          <button
            type="button"
            onClick={() => setBasketOpen(false)}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Nothing yet. Sukkari is the one people come back for.
            </p>
          ) : (
            /* oxlint-disable-next-line jsx-a11y/no-redundant-roles */
            <ul role="list" className="flex flex-col gap-4">
              {lines.map((l) => (
                <li key={l.key} className="border-b border-[var(--line)] pb-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span>
                      {l.name}{" "}
                      <span className="text-[var(--muted)]">· {l.size}</span>
                    </span>
                    <span className="tabular-nums">{rupees(l.line)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`One fewer ${l.name} ${l.size}`}
                      onClick={() =>
                        setBasket((b) => {
                          const next = { ...b };
                          if ((next[l.key] ?? 0) <= 1) delete next[l.key];
                          else next[l.key] -= 1;
                          return next;
                        })
                      }
                      className="h-7 w-7 rounded-full border border-[var(--line)]"
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                    <button
                      type="button"
                      aria-label={`One more ${l.name} ${l.size}`}
                      disabled={l.qty >= MAX_PER_LINE}
                      onClick={() =>
                        setBasket((b) => ({
                          ...b,
                          [l.key]: Math.min((b[l.key] ?? 0) + 1, MAX_PER_LINE),
                        }))
                      }
                      className="h-7 w-7 rounded-full border border-[var(--line)] disabled:opacity-35"
                    >
                      +
                    </button>
                    {l.qty >= MAX_PER_LINE ? (
                      <span className="text-xs text-[var(--muted)]">
                        Max {MAX_PER_LINE}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 ? (
          <div className="border-t border-[var(--line)] px-4 py-4">
            <div className="flex justify-between text-base">
              <span>Subtotal</span>
              <span className="tabular-nums">{rupees(subtotal)}</span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-[var(--gold)] px-5 py-3 text-sm text-white"
            >
              Checkout
            </button>
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              Demo &mdash; no payment is taken
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
