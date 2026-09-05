import { act, render, screen } from "@testing-library/react";

import { HowWeWork } from "./HowWeWork";

test("renders every principle with its number and heading", () => {
  const { container } = render(<HowWeWork />);
  // Scoped to the cards: the section's own "02" index lives in the header.
  const numbers = [...container.querySelectorAll(".bv-stack__card > p:first-child")].map(
    (p) => p.textContent
  );
  expect(numbers).toEqual(["01", "02", "03", "04"]);
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
});

test("the section carries its place in the page's running order", () => {
  render(<HowWeWork />);
  // Decorative, so it must not land in the heading's accessible name.
  const heading = screen.getByRole("heading", { name: "How we work" });
  expect(heading).toBeInTheDocument();
});

test("cards are siblings in one container, so sticky stacking can work", () => {
  const { container } = render(<HowWeWork />);
  const deck = container.querySelector(".bv-stack__deck")!;
  const cards = [...deck.querySelectorAll(".bv-stack__card")];
  // A per-card wrapper would become each card's own sticky containing block
  // and the deck would never stack — the cards must be direct children.
  expect(cards).toHaveLength(4);
  for (const card of cards) expect(card.parentElement).toBe(deck);
});

test("sits inside a named landmark with a real heading", () => {
  render(<HowWeWork />);
  expect(screen.getByRole("region", { name: /how we work/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /how we work/i })).toBeInTheDocument();
});

test("the cards carry the deck classes so sticky stacking applies", () => {
  const { container } = render(<HowWeWork />);
  expect(container.querySelectorAll(".bv-stack__card")).toHaveLength(4);
  expect(container.querySelector(".bv-stack__runway")).not.toBeNull();
});

test("the counter and the card scaling derive from one active index", () => {
  const { container } = render(<HowWeWork />);
  const depths = [...container.querySelectorAll<HTMLElement>(".bv-stack__card")].map(
    (c) => Number(c.style.getPropertyValue("--bv-depth"))
  );
  const active = Number(
    container.querySelector<HTMLElement>(".bv-odo__reel")!.style.getPropertyValue("--bv-i")
  );
  // Layout-independent: whatever card is on top, every card below it is buried
  // by exactly its distance, and nothing above it is scaled at all.
  expect(depths).toEqual(depths.map((_, i) => Math.max(0, active - i)));
  expect(depths.every((d) => d >= 0)).toBe(true);
});

test("the odometer reel holds one digit per principle", () => {
  const { container } = render(<HowWeWork />);
  expect(container.querySelectorAll(".bv-odo__reel > span")).toHaveLength(4);
});

test("the decorative counter is hidden from assistive tech — the cards already number themselves", () => {
  const { container } = render(<HowWeWork />);
  expect(container.querySelector(".bv-odo")).toHaveAttribute("aria-hidden");
});

test("the label's height is measured, not assumed, so copy edits cannot clip it", () => {
  let fire: () => void = () => {};
  const disconnect = vi.fn();
  const original = window.ResizeObserver;
  class FakeRO {
    constructor(cb: () => void) {
      fire = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {
      disconnect();
    }
  }
  window.ResizeObserver = FakeRO as unknown as typeof ResizeObserver;

  try {
    const { container, unmount } = render(<HowWeWork />);
    const section = container.querySelector<HTMLElement>(".bv-stack")!;
    const pin = container.querySelector<HTMLElement>(".bv-stack__pin")!;

    // Until measured, the stylesheet's fallback stands — nothing inline.
    expect(section.style.getPropertyValue("--bv-label-h")).toBe("");

    pin.getBoundingClientRect = () => ({ height: 131 }) as DOMRect;
    act(() => fire());
    expect(section.style.getPropertyValue("--bv-label-h")).toBe("131px");

    // A zero height (detached / not yet laid out) must not overwrite it.
    pin.getBoundingClientRect = () => ({ height: 0 }) as DOMRect;
    act(() => fire());
    expect(section.style.getPropertyValue("--bv-label-h")).toBe("131px");

    unmount();
    expect(disconnect).toHaveBeenCalled();
  } finally {
    window.ResizeObserver = original;
  }
});
