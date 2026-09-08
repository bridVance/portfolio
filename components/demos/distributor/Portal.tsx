"use client";

import { useMemo, useState } from "react";

/**
 * Case study: a B2B ordering portal for distributors.
 *
 * Built to the design system ui-ux-pro-max returned for "B2B wholesale
 * distributor ordering portal": Trust & Authority + Conversion, the Accessible
 * & Ethical style, its slate-and-blue palette, Plus Jakarta Sans throughout.
 *
 * This is the one demo that is an application rather than a page, so the
 * skill's dashboard guidance applies over its landing-page section order:
 * summary before detail, and state encoded in form as well as number, so what
 * needs attention reads at a glance rather than being decoded from a figure.
 *
 * Tiered pricing is the whole point of a portal like this — the unit price
 * drops at 50 and 200 units, and the table shows which tier each line has
 * reached rather than making the buyer work it out.
 */

const TIERS = [
  { min: 200, off: 0.18, label: "200+" },
  { min: 50, off: 0.1, label: "50+" },
  { min: 0, off: 0, label: "Base" },
] as const;

const CATALOGUE = [
  { sku: "BV-1010", name: "Chilli oil, 250ml", pack: 12, list: 210, stock: 1840 },
  { sku: "BV-1024", name: "Tamarind paste, 500g", pack: 12, list: 165, stock: 620 },
  { sku: "BV-2201", name: "Coconut vinegar, 1L", pack: 6, list: 240, stock: 96 },
  { sku: "BV-3040", name: "Peppercorn, 100g", pack: 24, list: 320, stock: 0 },
  { sku: "BV-3115", name: "Curry leaf powder, 200g", pack: 24, list: 145, stock: 2400 },
  { sku: "BV-4402", name: "Jaggery blocks, 5kg", pack: 4, list: 690, stock: 310 },
] as const;

const CREDIT_LIMIT = 250000;
const OUTSTANDING = 82400;

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const tierFor = (qty: number) => TIERS.find((t) => qty >= t.min)!;

export function Portal() {
  const [qty, setQty] = useState<Record<string, number>>({ "BV-1010": 60 });
  const [submitted, setSubmitted] = useState(false);

  const lines = useMemo(
    () =>
      CATALOGUE.map((p) => {
        const q = qty[p.sku] ?? 0;
        const tier = tierFor(q);
        const unit = p.list * (1 - tier.off);
        return { ...p, q, tier, unit, total: unit * q };
      }).filter((l) => l.q > 0),
    [qty]
  );

  const subtotal = lines.reduce((n, l) => n + l.total, 0);
  const gst = Math.round(subtotal * 0.12);
  const total = subtotal + gst;
  const available = CREDIT_LIMIT - OUTSTANDING;
  const overCredit = total > available;

  return (
    <div className="dist min-h-screen">
      <style>{`
        .dist {
          --ink: #020617;
          --slate: #0F172A;
          --blue: #0369A1;
          --paper: #F8FAFC;
          --card: #FFFFFF;
          --line: #E2E8F0;
          --muted: #475569;
          --ok: #15803D;
          --warn: #B45309;
          --bad: #B91C1C;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-jakarta), system-ui, sans-serif;
        }
        .dist a:focus-visible, .dist button:focus-visible, .dist input:focus-visible {
          outline: 3px solid var(--blue); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .dist * { transition: none !important; }
        }
      `}</style>

      <header className="border-b border-[var(--line)] bg-[var(--slate)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold tracking-tight">Meridian Trading</span>
            <span className="text-[0.62rem] uppercase tracking-[0.18em] text-white/50">
              Distributor portal
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/70">Kochi &mdash; Territory 04</span>
            <span className="rounded-full bg-white/10 px-3 py-1">SR</span>
          </div>
        </div>
      </header>

      {/* Summary before detail. */}
      <section className="mx-auto max-w-6xl px-5 py-6">
        <h1 className="sr-only">Ordering dashboard</h1>
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Credit limit", rupees(CREDIT_LIMIT), null],
            ["Outstanding", rupees(OUTSTANDING), "warn"],
            ["Available", rupees(available), "ok"],
            ["Next delivery", "Thu, 11 Sep", null],
          ].map(([label, value, tone]) => (
            <li
              key={label as string}
              className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4"
            >
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                {label}
              </p>
              <p
                className="mt-1.5 text-xl font-semibold tabular-nums"
                style={{
                  color:
                    tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : undefined,
                }}
              >
                {value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--card)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
            <h2 className="font-semibold">Catalogue</h2>
            <p className="text-sm text-[var(--muted)]">
              Unit price drops at 50 and 200 units
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <caption className="sr-only">
                Products with pack size, stock, tiered unit price and order quantity
              </caption>
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                  <th scope="col" className="px-4 py-2.5 font-medium">Product</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Stock</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">List</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Qty</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Tier</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {CATALOGUE.map((p) => {
                  const q = qty[p.sku] ?? 0;
                  const tier = tierFor(q);
                  const unit = p.list * (1 - tier.off);
                  const out = p.stock === 0;
                  const low = p.stock > 0 && p.stock < 120;
                  return (
                    <tr key={p.sku} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-xs text-[var(--muted)]">
                          {p.sku} · case of {p.pack}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* State in form as well as number: a colour alone
                            would not survive a greyscale print or a colour
                            vision difference. */}
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                          style={{
                            background: out ? "#FEE2E2" : low ? "#FEF3C7" : "#DCFCE7",
                            color: out ? "var(--bad)" : low ? "var(--warn)" : "var(--ok)",
                          }}
                        >
                          {out ? "Out of stock" : low ? `Low · ${p.stock}` : `In stock · ${p.stock}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{rupees(p.list)}</td>
                      <td className="px-4 py-3">
                        <label className="sr-only" htmlFor={`q-${p.sku}`}>
                          Quantity of {p.name}
                        </label>
                        <input
                          id={`q-${p.sku}`}
                          type="number"
                          min={0}
                          max={p.stock}
                          step={p.pack}
                          disabled={out}
                          value={q || ""}
                          placeholder="0"
                          aria-describedby={q >= p.stock ? `stock-${p.sku}` : undefined}
                          // Clamped on the way in, so a quantity larger than
                          // the stock cannot be entered at all. `max` alone
                          // does not do this: the browser will happily accept
                          // a typed value above it and only complain on submit,
                          // which is how 24,852 units of a 620-unit line came
                          // to be priced at sixteen crore.
                          onChange={(e) =>
                            setQty((s) => ({
                              ...s,
                              [p.sku]: Math.max(
                                0,
                                Math.min(Number(e.target.value) || 0, p.stock)
                              ),
                            }))
                          }
                          className="w-24 rounded-md border border-[var(--line)] bg-white px-2.5 py-1.5 tabular-nums disabled:cursor-not-allowed disabled:bg-[var(--paper)] disabled:text-[var(--muted)]"
                        />
                        {q >= p.stock && p.stock > 0 ? (
                          <span
                            id={`stock-${p.sku}`}
                            className="mt-1 block text-xs text-[var(--muted)]"
                          >
                            All {p.stock} in stock
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded px-2 py-1 text-xs"
                          style={{
                            background: tier.off ? "#E0F2FE" : "transparent",
                            color: tier.off ? "var(--blue)" : "var(--muted)",
                          }}
                        >
                          {tier.label}
                          {tier.off ? ` · −${Math.round(tier.off * 100)}%` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {q > 0 ? rupees(unit * q) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
            <h2 className="font-semibold">Recent orders</h2>
            {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ul role="list" className="mt-3 flex flex-col divide-y divide-[var(--line)]">
              {[
                ["SO-4471", "2 Sep", "₹64,200", "Delivered"],
                ["SO-4455", "26 Aug", "₹41,880", "Delivered"],
                ["SO-4431", "19 Aug", "₹18,320", "Invoiced"],
              ].map(([id, date, amt, status]) => (
                <li key={id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="font-medium">{id}</span>
                  <span className="text-[var(--muted)]">{date}</span>
                  <span className="tabular-nums">{amt}</span>
                  <span className="text-[var(--ok)]">{status}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
            <h2 className="font-semibold">This order</h2>
            {lines.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Enter a quantity to start. Case sizes are pre-set.
              </p>
            ) : (
              <>
                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">{lines.length} lines</dt>
                    <dd className="tabular-nums">{rupees(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">GST (12%)</dt>
                    <dd className="tabular-nums">{rupees(gst)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{rupees(total)}</dd>
                  </div>
                </dl>
                {overCredit ? (
                  <output
                    className="mt-3 block rounded-md px-3 py-2 text-sm"
                    style={{ background: "#FEE2E2", color: "var(--bad)" }}
                  >
                    {rupees(total - available)} over your available credit. Reduce the
                    order or clear an invoice to proceed.
                  </output>
                ) : null}
                {submitted ? (
                  <div className="mt-4 rounded-md border p-3" style={{ borderColor: "var(--ok)", background: "#F0FDF4" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--ok)" }}>
                      Order SO-4482 raised
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Demo &mdash; nothing was submitted.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setQty({});
                      }}
                      className="mt-3 w-full rounded-md border border-[var(--line)] px-4 py-2 text-sm"
                    >
                      Start a new order
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={overCredit}
                      onClick={() => setSubmitted(true)}
                      className="mt-4 w-full rounded-md bg-[var(--blue)] px-4 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Submit order
                    </button>
                    <p className="mt-2 text-center text-xs text-[var(--muted)]">
                      Demo &mdash; no order is placed
                    </p>
                  </>
                )}
              </>
            )}
          </aside>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-6 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--muted)]">
          Demo site · BridVance
        </p>
      </footer>
    </div>
  );
}
