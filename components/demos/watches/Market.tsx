"use client";

import { useState } from "react";

/**
 * Case study: a vintage watch marketplace.
 *
 * Built to the design system ui-ux-pro-max returned for "vintage luxury watch
 * marketplace resale": Hero + Testimonials + CTA, the Vibrant & Block-based
 * style, its violet-and-green palette, and the pairing it chose — Inter for
 * headings over Playfair Display for body, which is the inversion of the usual
 * luxury pattern and is what stops the page reading like every other resale
 * site.
 *
 * On a marketplace the detail page does the selling, so the listing opens into
 * provenance: a dated chain of custody and service history, with condition
 * graded on a stated scale rather than an adjective. Green is reserved for
 * verification and nothing else — an accent that means something is worth more
 * than one that decorates.
 */

const LISTINGS = [
  {
    id: "sub-1969",
    model: "Diver, 1969",
    ref: "Ref. 5513",
    price: 1480000,
    grade: 3,
    verified: true,
    tone: "#2B2B33",
    provenance: [
      ["1969", "Sold new, Geneva"],
      ["1994", "Second owner, service at maker"],
      ["2018", "Movement serviced, original bezel retained"],
      ["2024", "Consigned, papers present"],
    ],
  },
  {
    id: "chrono-1972",
    model: "Chronograph, 1972",
    ref: "Ref. 6239",
    price: 2260000,
    grade: 2,
    verified: true,
    tone: "#5B4A2E",
    provenance: [
      ["1972", "Retailed in Milan"],
      ["2001", "Dial refinished — disclosed"],
      ["2023", "Consigned, no papers"],
    ],
  },
  {
    id: "field-1965",
    model: "Field watch, 1965",
    ref: "Ref. W10",
    price: 168000,
    grade: 4,
    verified: false,
    tone: "#3A4A38",
    provenance: [
      ["1965", "Military issue"],
      ["2019", "Civilian sale"],
      ["2025", "Consigned, verification pending"],
    ],
  },
] as const;

const GRADES: Record<number, string> = {
  1: "Unpolished, collector grade",
  2: "Light wear, honest",
  3: "Worn, correct throughout",
  4: "Heavy wear, serviceable",
};

const rupees = (n: number) => `₹${(n / 100000).toFixed(2)} L`;

export function Market() {
  const [openId, setOpenId] = useState<string>(LISTINGS[0].id);
  const open = LISTINGS.find((l) => l.id === openId)!;

  return (
    <div className="watch min-h-screen">
      <style>{`
        .watch {
          --violet: #7C3AED;
          --green: #16A34A;
          --ink: #4C1D95;
          --paper: #FAF5FF;
          --card: #FFFFFF;
          --line: #DDD6FE;
          --muted: #6B5B92;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-playfair-body), Georgia, serif;
        }
        .watch h1, .watch h2, .watch h3, .watch .ui {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .watch button:focus-visible, .watch a:focus-visible {
          outline: 3px solid var(--violet); outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .watch * { transition: none !important; }
        }
      `}</style>

      <header className="flex items-center justify-between gap-4 border-b-2 border-[var(--ink)] px-5 py-3">
        <span className="ui text-lg">Fifth Hand</span>
        <nav aria-label="Site" className="hidden gap-6 text-sm sm:flex">
          <a href="#listings" className="hover:text-[var(--violet)]">Listings</a>
          <a href="#how" className="hover:text-[var(--violet)]">How we verify</a>
        </nav>
        <a href="#listings" className="ui bg-[var(--ink)] px-5 py-2 text-sm text-white">
          Browse
        </a>
      </header>

      <section className="bg-[var(--violet)] px-5 py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className="max-w-[15ch] text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95]">
            Every watch, with its whole history attached.
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-white/85">
            We do not describe a watch as &ldquo;excellent&rdquo;. We tell you
            what was replaced, when, and by whom &mdash; and we say so when we
            cannot prove it.
          </p>
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-3xl">Current listings</h2>
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="mt-7 grid gap-4 md:grid-cols-3">
          {LISTINGS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setOpenId(l.id)}
                aria-pressed={openId === l.id}
                aria-label={`${l.model}, ${l.ref} — view provenance`}
                className={`flex h-full w-full flex-col border-2 text-left ${
                  openId === l.id ? "border-[var(--violet)]" : "border-[var(--ink)]"
                } bg-[var(--card)]`}
              >
                <span
                  aria-hidden
                  className="flex h-40 items-center justify-center"
                  style={{ background: `${l.tone}1A` }}
                >
                  <span
                    className="block h-24 w-24 rounded-full border-[6px]"
                    style={{ borderColor: l.tone, background: `${l.tone}22` }}
                  />
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="ui text-lg">{l.model}</span>
                  <span className="text-sm text-[var(--muted)]">{l.ref}</span>
                  <span className="mt-3 flex items-center gap-2">
                    {/* Verification is the only thing green means here. */}
                    {l.verified ? (
                      <span className="ui bg-[var(--green)] px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-white">
                        Verified
                      </span>
                    ) : (
                      <span className="ui border border-[var(--muted)] px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                        Pending
                      </span>
                    )}
                    <span className="text-xs text-[var(--muted)]">Grade {l.grade}/4</span>
                  </span>
                  <span className="ui mt-3 text-xl tabular-nums">{rupees(l.price)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* The detail is where a marketplace is won, so provenance gets a block
          of its own rather than a line in a spec table. */}
      <section className="bg-[var(--ink)] px-5 py-14 text-white">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <p className="ui text-[0.68rem] uppercase tracking-[0.24em] text-[var(--line)]">
              Provenance
            </p>
            <h2 className="mt-3 text-3xl text-white">{open.model}</h2>
            <p className="mt-2 text-white/70">
              {open.ref} · Grade {open.grade} of 4 &mdash; {GRADES[open.grade]}
            </p>
            <p className="mt-5 max-w-[44ch] leading-relaxed text-white/75">
              {open.verified
                ? "Serial, movement and case have been checked against the maker's archive."
                : "Archive check is still open. We list it, we price it lower, and we say so."}
            </p>
          </div>
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ol role="list" className="flex flex-col">
            {open.provenance.map(([year, what], i) => (
              <li
                key={year}
                className={`flex gap-5 border-l-2 border-[var(--violet)] pb-6 pl-5 ${
                  i === open.provenance.length - 1 ? "border-transparent pb-0" : ""
                }`}
              >
                <span className="ui w-14 shrink-0 tabular-nums text-[var(--line)]">{year}</span>
                <span className="text-white/85">{what}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-3xl">What buyers say</h2>
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["They told me the dial was refinished before I asked.", "Collector, Mumbai"],
            ["First listing I have seen that admits what it cannot prove.", "Dealer, Dubai"],
            ["The grade meant the same thing on both watches I bought.", "Buyer, Bengaluru"],
          ].map(([q, w]) => (
            <li key={w} className="border-2 border-[var(--ink)] bg-[var(--card)] p-5">
              <p className="leading-relaxed">&ldquo;{q}&rdquo;</p>
              <p className="ui mt-3 text-sm text-[var(--muted)]">{w}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="bg-[var(--violet)] p-8 text-white md:p-14">
          <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white">
            Selling something with a story?
          </h2>
          <p className="mt-4 max-w-[46ch] text-white/85">
            We take twelve percent, we photograph it properly, and we will not
            list it until the archive comes back.
          </p>
          <button
            type="button"
            className="ui mt-7 bg-white px-8 py-3.5 text-sm text-[var(--ink)]"
          >
            Consign a watch
          </button>
          <p className="mt-3 text-sm text-white/60">Demo &mdash; nothing is submitted</p>
        </div>
      </section>

      <footer className="border-t-2 border-[var(--ink)] py-8 text-center">
        <p className="ui text-[0.68rem] uppercase tracking-[0.2em] text-[var(--muted)]">
          Demo site · BridVance
        </p>
      </footer>
    </div>
  );
}
