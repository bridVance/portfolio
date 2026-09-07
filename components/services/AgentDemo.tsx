"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Turn = {
  from: "agent" | "customer";
  text: string;
  /** Shown under the turn, e.g. the document an answer was drawn from. */
  cite?: string;
};

/**
 * A short worked example of what one packaged agent actually does, played out
 * as a transcript rather than described. The turns arrive on a stagger the
 * first time the card comes into view.
 *
 * One observer per demo, not one per bubble: the stagger is CSS keyed off a
 * single `data-shown` flag, so a page of five of these costs five observers
 * rather than twenty. The whole transcript is in the DOM from the start —
 * these are real words that explain the service, so they belong to readers and
 * to search, not only to people who can see the animation.
 */
export function AgentDemo({ turns, label }: { turns: readonly Turn[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bv-chat mt-5 rounded-lg border border-line bg-surface p-4"
      data-shown={shown || undefined}
    >
      {/* Said out loud, not only to screen readers: these read as real
          because they are specific, so the page should be the thing that says
          they are illustrations. The agent's name stays visually hidden —
          the heading above already carries it. */}
      <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
        Example conversation
        <span className="sr-only">: {label}</span>
      </p>
      {/* explicit role="list": Tailwind preflight's list-style:none strips the
          implicit list role in Safari/VoiceOver. */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol role="list" className="flex flex-col gap-2">
        {turns.map((turn, i) => (
          <li
            key={turn.text}
            className={cn(
              "bv-turn flex",
              turn.from === "customer" ? "justify-end" : "justify-start"
            )}
            style={{ transitionDelay: `${i * 240}ms` }}
          >
            <span
              className={cn(
                "max-w-[86%] rounded-lg px-3 py-2 font-body text-sm leading-snug",
                turn.from === "customer"
                  ? "bg-accent text-on-accent"
                  : "bg-surface-2 text-fg"
              )}
            >
              {turn.text}
              {turn.cite ? (
                <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                  {turn.cite}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
