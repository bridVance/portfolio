"use client";

import { useState } from "react";

/**
 * Case study: a restaurant site.
 *
 * Built to the design system ui-ux-pro-max returned for "restaurant menu
 * reservations hospitality": the Funnel (3-Step Conversion) pattern, the
 * Vibrant & Block-based style, its red-and-gold palette, Playfair Display SC
 * over Karla.
 *
 * The funnel is the structure, not a decoration on top of it: the page moves a
 * visitor from wanting to eat, to choosing a table, to holding it, and the
 * booking is three real steps with the state carried between them. Blocks of
 * flat colour do the sectioning, which is what "block-based" means here — no
 * gradients, no soft cards, hard edges between one idea and the next.
 */

const MENU = [
  { course: "To start", items: [
    ["Kappa & meen", "Tapioca, sardine, coconut", 260],
    ["Beetroot pachadi", "Yoghurt, mustard, curry leaf", 220],
  ]},
  { course: "Mains", items: [
    ["Thalassery biryani", "Kaima rice, chicken, fried shallot", 480],
    ["Meen pollichathu", "Pearl spot, banana leaf, kudampuli", 620],
    ["Olan", "Ash gourd, cowpea, coconut milk", 340],
  ]},
  { course: "After", items: [
    ["Ada pradhaman", "Jaggery, coconut milk, rice ada", 190],
    ["Filter coffee", "Chicory, second decoction", 90],
  ]},
] as const;

const SIZES = [2, 3, 4, 6, 8] as const;
const TIMES = ["12:30", "13:15", "19:00", "19:45", "20:30", "21:15"] as const;

export function Site() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [held, setHeld] = useState(false);

  return (
    <div className="rest min-h-screen">
      <style>{`
        .rest {
          --red: #DC2626;
          /* Text on red: #FEF2F2 over #DC2626 is 4.41, just under. */
          --red-deep: #B91C1C;
          --gold: #A16207;
          --ink: #450A0A;
          --paper: #FEF2F2;
          --card: #FFFFFF;
          --line: #FECACA;
          --muted: #7B3B3B;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-karla), system-ui, sans-serif;
        }
        .rest h1, .rest h2, .rest h3, .rest .display {
          font-family: var(--font-playfair), Georgia, serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        .rest button:focus-visible, .rest a:focus-visible {
          outline: 3px solid var(--gold); outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .rest * { transition: none !important; }
        }
      `}</style>

      <header className="flex items-center justify-between gap-4 bg-[var(--ink)] px-5 py-3 text-[var(--paper)]">
        <span className="display text-xl">Kaithara</span>
        <nav aria-label="Site" className="hidden gap-6 text-sm sm:flex">
          <a href="#menu" className="hover:text-[var(--line)]">Menu</a>
          <a href="#book" className="hover:text-[var(--line)]">Book a table</a>
        </nav>
        <a href="#book" className="bg-[var(--red-deep)] px-5 py-2 text-sm text-white">Book</a>
      </header>

      {/* Hero block */}
      <section className="bg-[var(--red-deep)] px-5 py-16 text-[var(--paper)] md:py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className="max-w-[16ch] text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.98]">
            Kerala cooking, without the buffet.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-[var(--paper)]/85">
            Twenty-eight covers, one sitting at a time, a menu that changes when
            the boats do.
          </p>
          <a href="#book" className="mt-8 inline-block bg-[var(--paper)] px-8 py-3.5 text-sm text-[var(--ink)]">
            Book a table
          </a>
        </div>
      </section>

      {/* Step 1 — the problem worth solving */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Step one</p>
        <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,4.5vw,3rem)] leading-tight">
          You already know what you want to eat. You just cannot see it.
        </h2>
        <p className="mt-4 max-w-[54ch] leading-relaxed text-[var(--muted)]">
          Most restaurant sites hide the menu behind a PDF from 2019. Here it is,
          with prices, on the page.
        </p>
      </section>

      {/* Step 2 — the menu */}
      <section id="menu" className="bg-[var(--ink)] px-5 py-14 text-[var(--paper)]">
        <div className="mx-auto max-w-5xl">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--line)]">Step two</p>
          <h2 className="mt-3 text-[clamp(1.9rem,4.5vw,3rem)]">This week&rsquo;s menu</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {MENU.map((group) => (
              <div key={group.course}>
                <h3 className="display border-b border-[var(--paper)]/25 pb-2 text-xl">
                  {group.course}
                </h3>
                {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
                <ul role="list" className="mt-4 flex flex-col gap-4">
                  {group.items.map(([name, note, price]) => (
                    <li key={name as string}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span>{name}</span>
                        <span className="tabular-nums text-[var(--line)]">₹{price}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--paper)]/60">{note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 3 — the action */}
      <section id="book" className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Step three</p>
        <h2 className="mt-3 text-[clamp(1.9rem,4.5vw,3rem)]">Hold a table</h2>

        <ol className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Booking progress">
          {["Party", "Time", "Confirm"].map((label, i) => (
            <li
              key={label}
              aria-current={step === i + 1 ? "step" : undefined}
              className={`px-4 py-2 ${
                step === i + 1
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : step > i + 1
                    ? "bg-[var(--gold)] text-white"
                    : "border border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="mt-6 border-2 border-[var(--ink)] bg-[var(--card)] p-6 md:p-8">
          {step === 1 ? (
            <fieldset>
              <legend className="display text-2xl">How many of you?</legend>
              <div className="mt-5 flex flex-wrap gap-2">
                {SIZES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={size === n}
                    onClick={() => {
                      setSize(n);
                      setStep(2);
                    }}
                    className={`h-14 w-14 border-2 border-[var(--ink)] text-lg tabular-nums ${
                      size === n ? "bg-[var(--ink)] text-[var(--paper)]" : ""
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Nine or more is a private sitting &mdash; ring us instead.
              </p>
            </fieldset>
          ) : step === 2 ? (
            <fieldset>
              <legend className="display text-2xl">When, on Saturday?</legend>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={time === t}
                    onClick={() => {
                      setTime(t);
                      setStep(3);
                    }}
                    className={`border-2 border-[var(--ink)] py-3 tabular-nums ${
                      time === t ? "bg-[var(--ink)] text-[var(--paper)]" : ""
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-5 text-sm underline underline-offset-4"
              >
                Back to party size
              </button>
            </fieldset>
          ) : (
            <div>
              <h3 className="display text-2xl">
                Table for {size}, Saturday at {time}
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-[var(--muted)]">
                We hold tables for fifteen minutes. A real booking would take a
                name and a number here &mdash; this is a portfolio demo, so
                nothing was reserved and nothing was collected.
              </p>
              {held ? (
                <output className="mt-6 block border-2 border-[var(--gold)] p-4">
                  <span className="display block text-xl">Table held for 15 minutes</span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
                    Demo &mdash; nothing was reserved.
                  </span>
                </output>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setHeld(true)}
                  disabled={held}
                  className="bg-[var(--red-deep)] px-7 py-3 text-sm text-white disabled:opacity-45"
                >
                  {held ? "Held" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setHeld(false);
                    setSize(null);
                    setTime(null);
                  }}
                  className="border-2 border-[var(--ink)] px-7 py-3 text-sm"
                >
                  Start again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[var(--ink)] px-5 py-8 text-center text-[var(--paper)]/60">
        <p className="text-[0.68rem] uppercase tracking-[0.2em]">Demo site · BridVance</p>
      </footer>
    </div>
  );
}
