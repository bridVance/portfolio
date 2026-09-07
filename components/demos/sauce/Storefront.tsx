"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Case study: a small-batch vegan condiment label.
 *
 * Built to the design system ui-ux-pro-max returned for "vegan sauce condiment
 * artisan food": the Hero + Features + CTA pattern, Minimalism & Swiss Style,
 * its orange-on-warm-white palette with a blue CTA, and Amatic SC over Cabin.
 * Swiss here means the grid does the work — flush-left type, hard rules,
 * generous space, and no ornament that is not information.
 *
 * The client is not named, so the wordmark is a redaction rather than an
 * invented brand: a made-up name on a portfolio piece reads as a real company
 * to anyone who does not look twice.
 *
 * The cart is real — quantities, subtotal, GST and a shipping threshold that
 * actually applies, persisted across reloads. Checkout stops at a labelled
 * demo step; nothing takes a payment or asks for a card.
 */

const PRODUCTS = [
  { id: "smoke", name: "Smoked Chilli", note: "Chipotle, tomato, jaggery", heat: 3, price: 420 },
  { id: "herb", name: "Green Herb", note: "Coriander, mint, green chilli", heat: 2, price: 380 },
  { id: "peanut", name: "Peanut Satay", note: "Roasted peanut, tamarind, lime", heat: 1, price: 450 },
  { id: "garlic", name: "Black Garlic", note: "Fermented garlic, sesame, rice vinegar", heat: 1, price: 520 },
  { id: "mango", name: "Mango Habanero", note: "Alphonso, habanero, sea salt", heat: 4, price: 440 },
  { id: "beet", name: "Beet & Horseradish", note: "Beetroot, horseradish, dill", heat: 2, price: 400 },
] as const;

const FREE_SHIPPING_OVER = 1500;
const SHIPPING = 90;
const GST_RATE = 0.05; // packaged food

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type Lines = Record<string, number>;
const STORAGE = "bv-demo-sauce-cart";

export function Storefront() {
  const [lines, setLines] = useState<Lines>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Restored after mount, never during render: the server has no localStorage,
  // and seeding state from it would hydrate against a different first paint.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      // oxlint-disable-next-line react/set-state-in-effect
      if (raw) setLines(JSON.parse(raw) as Lines);
    } catch {
      /* private mode or cleared storage — an empty cart is a fine fallback */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(lines));
    } catch {
      /* the cart simply will not survive a reload */
    }
  }, [lines]);

  const add = useCallback((id: string) => {
    setLines((l) => ({ ...l, [id]: (l[id] ?? 0) + 1 }));
    setCartOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((l) => {
      const next = { ...l };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const totals = useMemo(() => {
    const items = Object.entries(lines).flatMap(([id, qty]) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return p ? [{ ...p, qty, line: p.price * qty }] : [];
    });
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.line, 0);
    const shipping = count === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING;
    const gst = Math.round(subtotal * GST_RATE);
    return { items, count, subtotal, shipping, gst, total: subtotal + shipping + gst };
  }, [lines]);

  return (
    <div className="sauce min-h-screen">
      <style>{`
        .sauce {
          --orange: #EA580C;
          --blue: #2563EB;
          --ink: #0F172A;
          --paper: #FFF7ED;
          --card: #FFFFFF;
          --line: #FCEAE1;
          --muted: #57534E;
          background: var(--paper);
          color: var(--ink);
        }
        .sauce h1, .sauce h2, .sauce .display {
          font-family: var(--font-amatic), ui-sans-serif, cursive;
          font-weight: 700;
          line-height: 0.92;
          letter-spacing: 0.01em;
        }
        .sauce, .sauce button, .sauce input {
          font-family: var(--font-cabin), system-ui, sans-serif;
        }
        /* Swiss: the rule is structure, not decoration. */
        .sauce .rule { border-top: 2px solid var(--ink); }
        .sauce ::selection { background: var(--orange); color: #fff; }
        .sauce a:focus-visible, .sauce button:focus-visible {
          outline: 3px solid var(--blue); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .sauce * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="border-b-2 border-[var(--ink)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="sr-only">Vegan sauce brand, client name withheld</span>
            <span aria-hidden className="inline-block h-4 w-24 bg-[var(--ink)]" />
            <span aria-hidden className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--muted)]">
              name withheld
            </span>
          </div>
          <nav aria-label="Shop" className="hidden gap-7 text-sm sm:flex">
            <a href="#shop" className="hover:text-[var(--orange)]">Shop</a>
            <a href="#features" className="hover:text-[var(--orange)]">What is in it</a>
            <a href="#cta" className="hover:text-[var(--orange)]">Stockists</a>
          </nav>
          <button
            type="button"
            onClick={() => setCartOpen((v) => !v)}
            aria-expanded={cartOpen}
            aria-controls="sauce-cart"
            className="border-2 border-[var(--ink)] px-4 py-1.5 text-sm"
          >
            Cart{totals.count > 0 ? ` (${totals.count})` : ""}
          </button>
        </div>
      </header>

      {/* Hero: headline and image, flush left on a hard grid. */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--orange)]">
            Six sauces · Cooked in Kerala
          </p>
          <h1 className="mt-6 text-[clamp(3.5rem,11vw,8rem)]">
            Plants can carry
            <br />
            the whole plate.
          </h1>
          <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-[var(--muted)]">
            Cooked slowly from produce bought the same week. No stabilisers, no
            thickeners, nothing you would not find in a pantry.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#shop" className="bg-[var(--blue)] px-8 py-3.5 text-sm text-white">
              Shop the six
            </a>
            <a href="#features" className="border-2 border-[var(--ink)] px-8 py-3.5 text-sm">
              What goes in
            </a>
          </div>
        </div>
        <div aria-hidden className="md:col-span-5">
          {/* Six bottles on a grid — the plants are the subject, so they are
              drawn as leaves rather than photographed labels. */}
          <div className="grid grid-cols-3 gap-3">
            {PRODUCTS.map((p, i) => (
              <div
                key={p.id}
                className="flex aspect-[3/4] items-end justify-center border-2 border-[var(--ink)] bg-[var(--card)] p-3"
              >
                <svg viewBox="0 0 24 34" className="h-full w-auto" fill="none">
                  <rect x="7" y="1" width="10" height="5" fill="var(--ink)" />
                  <path
                    d="M5 10h14v22a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Z"
                    fill={i % 2 ? "var(--orange)" : "var(--ink)"}
                  />
                  <path d="M12 30c0-4 2-7 6-8 0 5-2 8-6 8Z" fill="var(--paper)" opacity=".85" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="rule" />
        <p className="py-10 text-[clamp(1.5rem,3.4vw,2.6rem)] leading-tight md:max-w-[24ch]">
          Most sauces are thickened, coloured and shelf-stabilised.
          <span className="text-[var(--orange)]"> Ours are cooked, bottled and sold.</span>
        </p>
      </section>

      {/* Key features: four, per the pattern's 3–5. */}
      <section id="features" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rule" />
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Produce", "Bought weekly from growers in Wayanad and Idukki."],
            ["02", "Cold-pressed oil", "Groundnut, pressed rather than refined."],
            ["03", "Salt and acid", "Sea salt, tamarind, rice vinegar. No citric acid."],
            ["04", "Time", "Six hours on low heat, which is the whole trick."],
          ].map(([n, h, b]) => (
            <li key={n}>
              <p className="text-[0.68rem] tracking-[0.2em] text-[var(--orange)]">{n}</p>
              <h3 className="display mt-3 text-3xl">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rule" />
        <div className="flex flex-wrap items-baseline justify-between gap-3 pt-10">
          <h2 className="text-5xl">The six</h2>
          <p className="text-sm text-[var(--muted)]">
            250ml each · free delivery over {rupees(FREE_SHIPPING_OVER)}
          </p>
        </div>
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="mt-8 grid gap-px border-2 border-[var(--ink)] bg-[var(--ink)] sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="flex flex-col bg-[var(--card)] p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="display text-3xl">{p.name}</h3>
                <span className="text-lg tabular-nums">{rupees(p.price)}</span>
              </div>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{p.note}</p>
              <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--orange)]">
                Heat {p.heat} of 5
              </p>
              <button
                type="button"
                onClick={() => add(p.id)}
                className="mt-5 w-full bg-[var(--ink)] px-4 py-2.5 text-sm text-white"
              >
                Add to cart<span className="sr-only"> — {p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="border-2 border-[var(--ink)] bg-[var(--card)] p-8 md:p-14">
          <h2 className="max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)]">
            Stock it in your shop or kitchen.
          </h2>
          <p className="mt-4 max-w-[48ch] text-[var(--muted)]">
            Wholesale from twelve bottles. We deliver across Kerala weekly and
            ship the rest of India in three days.
          </p>
          <a href="#shop" className="mt-7 inline-block bg-[var(--blue)] px-8 py-3.5 text-sm text-white">
            Start an order
          </a>
        </div>
      </section>

      <footer className="border-t-2 border-[var(--ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:justify-between">
          <p>Cooked in Kerala · Shipped across India</p>
          <p className="text-[0.68rem] uppercase tracking-[0.2em]">Demo site · BridVance</p>
        </div>
      </footer>

      <aside
        id="sauce-cart"
        hidden={!cartOpen}
        aria-label="Your cart"
        className="fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l-2 border-[var(--ink)] bg-[var(--paper)]"
      >
        <div className="flex items-center justify-between border-b-2 border-[var(--ink)] px-4 py-3">
          <h2 className="text-3xl">Your cart</h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="border-2 border-[var(--ink)] px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {placed ? (
            <div className="border-2 border-[var(--ink)] p-4">
              <h3 className="display text-3xl">Checkout would start here</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                A real order would go to payment. This is a portfolio demo, so
                nothing was charged and no details were collected.
              </p>
              <button
                type="button"
                onClick={() => setPlaced(false)}
                className="mt-4 bg-[var(--ink)] px-4 py-2 text-sm text-white"
              >
                Back to cart
              </button>
            </div>
          ) : totals.items.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Nothing in here yet. The Smoked Chilli is where most people start.
            </p>
          ) : (
            /* oxlint-disable-next-line jsx-a11y/no-redundant-roles */
            <ul role="list" className="flex flex-col gap-4">
              {totals.items.map((i) => (
                <li key={i.id} className="border-b border-[var(--line)] pb-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p>{i.name}</p>
                    <span className="tabular-nums">{rupees(i.line)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(i.id, i.qty - 1)}
                      className="h-7 w-7 border-2 border-[var(--ink)]"
                      aria-label={`One fewer ${i.name}`}
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{i.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(i.id, i.qty + 1)}
                      className="h-7 w-7 border-2 border-[var(--ink)]"
                      aria-label={`One more ${i.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!placed && totals.items.length > 0 ? (
          <div className="border-t-2 border-[var(--ink)] px-4 py-4">
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd className="tabular-nums">{rupees(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">GST (5%)</dt>
                <dd className="tabular-nums">{rupees(totals.gst)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Delivery</dt>
                <dd className="tabular-nums">
                  {totals.shipping === 0 ? "Free" : rupees(totals.shipping)}
                </dd>
              </div>
              <div className="mt-1.5 flex justify-between border-t-2 border-[var(--ink)] pt-2 text-base">
                <dt>Total</dt>
                <dd className="tabular-nums">{rupees(totals.total)}</dd>
              </div>
            </dl>
            {totals.shipping > 0 ? (
              <p className="mt-2 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--orange)]">
                {rupees(FREE_SHIPPING_OVER - totals.subtotal)} more for free delivery
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setPlaced(true)}
              className="mt-4 w-full bg-[var(--blue)] px-5 py-3 text-white"
            >
              Checkout
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
