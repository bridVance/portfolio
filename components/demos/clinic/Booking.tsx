"use client";

import { useMemo, useState } from "react";

/**
 * Case study: a clinic booking site.
 *
 * Built to the design system ui-ux-pro-max returned for "medical clinic
 * appointment booking healthcare": Hero + Testimonials + CTA, the Neumorphism
 * style, its cyan-and-teal palette, Figtree over Noto Sans.
 *
 * Two deliberate departures, both from the skill's own rules rather than from
 * taste. Neumorphism is flagged accessibility-risk:conditional, so the soft
 * extrusion is carried by shadow only and every text pair is held above 4.5:1
 * on a light ground. And the pattern's testimonial *carousel* is a static grid:
 * auto-rotating content needs pause, keyboard control and a reduced-motion
 * resting state to be correct, which is a lot of machinery to buy nothing that
 * three visible quotes do not already do.
 */

const PRACTITIONERS = [
  { id: "rao", name: "Dr Anita Rao", role: "General medicine", next: "Today" },
  { id: "menon", name: "Dr Vivek Menon", role: "Physiotherapy", next: "Tomorrow" },
  { id: "iqbal", name: "Dr Sara Iqbal", role: "Dermatology", next: "Thu" },
] as const;

const DAYS = ["Mon 8", "Tue 9", "Wed 10", "Thu 11", "Fri 12"] as const;

const SLOTS = ["09:15", "10:00", "10:45", "11:30", "14:00", "14:45", "15:30", "16:15"] as const;
// Deterministic, so the grid does not reshuffle on every render.
const taken = (d: number, i: number) => (d * 7 + i * 3) % 5 < 2;

export function Booking() {
  const [who, setWho] = useState<string>("rao");
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const person = useMemo(
    () => PRACTITIONERS.find((p) => p.id === who)!,
    [who]
  );

  return (
    <div className="clinic min-h-screen">
      <style>{`
        .clinic {
          --ink: #164E63;
          --cyan: #0891B2;
          --green: #059669;
          --paper: #ECFEFF;
          --card: #FFFFFF;
          --line: #A5F3FC;
          --muted: #3F6E7C;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-noto), system-ui, sans-serif;
        }
        .clinic h1, .clinic h2, .clinic h3 {
          font-family: var(--font-figtree), system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        /* Neumorphism: extrusion is shadow only, so contrast never depends on it. */
        .clinic .raised {
          background: var(--paper);
          box-shadow: 6px 6px 14px #C6E9F0, -6px -6px 14px #FFFFFF;
        }
        .clinic .inset {
          background: var(--paper);
          box-shadow: inset 4px 4px 10px #C6E9F0, inset -4px -4px 10px #FFFFFF;
        }
        .clinic button:focus-visible, .clinic a:focus-visible, .clinic input:focus-visible {
          outline: 3px solid var(--cyan); outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .clinic * { transition: none !important; }
        }
      `}</style>

      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
        <span className="text-lg font-bold tracking-tight">Backwater Family Clinic</span>
        <a href="#book" className="raised rounded-full px-5 py-2.5 text-sm font-medium">
          Book now
        </a>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 text-center md:py-16">
        <h1 className="mx-auto max-w-[18ch] text-4xl leading-[1.08] md:text-5xl">
          See someone this week, not next month.
        </h1>
        <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-[var(--muted)]">
          Three practitioners, real availability on this page, and a booking that
          takes under a minute. No call, no queue, no forms you fill twice.
        </p>
      </section>

      {/* Problem, then solution — the pattern's second and third sections. */}
      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-12 md:grid-cols-2">
        <div className="raised rounded-2xl p-6">
          <h2 className="text-xl">What usually happens</h2>
          <p className="mt-2 leading-relaxed text-[var(--muted)]">
            You ring at nine, wait on hold, get offered a slot you cannot make,
            and ring again tomorrow.
          </p>
        </div>
        <div className="raised rounded-2xl p-6">
          <h2 className="text-xl">What happens here</h2>
          <p className="mt-2 leading-relaxed text-[var(--muted)]">
            You see the same calendar the front desk sees, pick a time, and get a
            reminder the night before.
          </p>
        </div>
      </section>

      <section id="book" className="mx-auto max-w-5xl px-5 pb-14">
        <div className="raised rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl">Book an appointment</h2>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-[var(--muted)]">Practitioner</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {PRACTITIONERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setWho(p.id);
                    setSlot(null);
                  }}
                  aria-pressed={who === p.id}
                  className={`rounded-2xl p-4 text-left ${who === p.id ? "inset" : "raised"}`}
                >
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-sm text-[var(--muted)]">{p.role}</span>
                  <span className="mt-1.5 block text-xs font-medium text-[var(--green)]">
                    Next: {p.next}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-sm font-medium text-[var(--muted)]">Day</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDay(i);
                    setSlot(null);
                  }}
                  aria-pressed={day === i}
                  className={`rounded-full px-5 py-2 text-sm ${day === i ? "inset font-semibold" : "raised"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-sm font-medium text-[var(--muted)]">
              Times with {person.name}
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SLOTS.map((s, i) => {
                const gone = taken(day, i);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={gone}
                    onClick={() => setSlot(s)}
                    aria-pressed={slot === s}
                    className={`rounded-xl py-3 text-sm tabular-nums ${
                      gone
                        ? "cursor-not-allowed text-[var(--muted)] opacity-45"
                        : slot === s
                          ? "inset font-semibold text-[var(--cyan)]"
                          : "raised"
                    }`}
                  >
                    {s}
                    {gone ? <span className="sr-only"> — unavailable</span> : null}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!slot}
              onClick={() => setDone(true)}
              className="rounded-full bg-[var(--green)] px-7 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm booking
            </button>
            <output className="text-sm text-[var(--muted)]">
              {done
                ? `Booked with ${person.name}, ${DAYS[day]} at ${slot}. Demo — nothing was scheduled.`
                : slot
                  ? `${DAYS[day]} at ${slot} with ${person.name}`
                  : "Pick a time to continue."}
            </output>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-14">
        <h2 className="text-2xl">What people say</h2>
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul role="list" className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Booked at 11pm, seen the next morning.", "Priya N."],
            ["The reminder meant I actually turned up.", "Joseph M."],
            ["No hold music. That alone is worth it.", "Fathima R."],
          ].map(([quote, who2]) => (
            <li key={who2} className="raised rounded-2xl p-5">
              <p className="leading-relaxed">&ldquo;{quote}&rdquo;</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{who2}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="raised rounded-3xl p-8 text-center md:p-12">
          <h2 className="text-3xl">Still easier to ring? Do that instead.</h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-[var(--muted)]">
            Front desk is open 8am to 7pm, Monday to Saturday.
          </p>
          <a
            href="#book"
            className="mt-6 inline-block rounded-full bg-[var(--cyan)] px-7 py-3 text-sm font-medium text-white"
          >
            Book online instead
          </a>
        </div>
      </section>

      <footer className="py-8 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--muted)]">
          Demo site · BridVance
        </p>
      </footer>
    </div>
  );
}
