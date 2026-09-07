import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import ServicesPage from "./page";

test("offers four tiers, numbered and in order", () => {
  render(<ServicesPage />);
  const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(h2s).toEqual([
    // Sites lead: for most businesses they are the way in.
    "Sites people actually use",
    "Agents with a fixed shape",
    "Parts we already own",
    "Built for one business",
    "Not sure which one you need?",
  ]);
});

test("leads with the cheapest way in and ends with a way to ask", () => {
  render(<ServicesPage />);
  expect(screen.getByRole("heading", { level: 1, name: "Services" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /start a project/i })).toHaveAttribute(
    "href",
    "/contact"
  );
});

test("claims packaged scope, not shelf inventory we do not have", () => {
  const { container } = render(<ServicesPage />);
  const text = (container.textContent ?? "").toLowerCase();
  // Kore.ai can advertise a marketplace of pre-built agents because one exists.
  // Nothing here may imply a catalogue that is ready to download today.
  for (const claim of ["marketplace", "pre-built", "off the shelf", "download"]) {
    expect(text).not.toContain(claim);
  }
});

test("website building stands as its own offering, not an item under the agents", () => {
  const { container } = render(<ServicesPage />);
  // Its own tier with its own heading — being one bullet among agents read as
  // an afterthought for half of what the studio sells.
  const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(h2s).toContain("Sites people actually use");
  for (const item of ["Business website", "Online store", "Landing pages", "Rebuilds"]) {
    expect(container.textContent).toContain(item);
  }
});

test("each packaged agent says what it covers and the business it fits", () => {
  render(<ServicesPage />);
  // Five packaged agents, and only those: an accelerator is a part rather than
  // a product, and bespoke work has no fixed audience to name.
  expect(screen.getAllByRole("list", { name: "Handles" })).toHaveLength(5);
  expect(screen.getAllByRole("list", { name: "Built for" })).toHaveLength(5);
  // The audience is named as a kind of business, which is what a visitor can
  // recognise themselves in — not as a job title or a market segment.
  expect(screen.getByText("Clinics")).toBeInTheDocument();
  expect(screen.getByText("Online stores")).toBeInTheDocument();
});

test("the booking agent does not name its audience twice", () => {
  const { container } = render(<ServicesPage />);
  // Its copy used to end on the same list its Built-for row now carries.
  expect(container.textContent).not.toContain(
    "Clinics, salons, studios, workshops"
  );
});

test("every offering renders a visual, not an empty card", () => {
  const { container } = render(<ServicesPage />);
  // PartDiagram keys its map by term in another file, so a term renamed here
  // fails silently there — the card keeps its heading and loses its diagram.
  // That has happened once already (a diagram whose rects had no size shipped
  // as an empty box), so this asserts the outcome rather than the wiring.
  const cards = [...container.querySelectorAll(".bv-card")];
  expect(cards.length).toBeGreaterThan(0);
  const bare = cards
    // .bv-scroll is the site mock, which is divs rather than an <svg>.
    .filter(
      (c) =>
        !c.querySelector("svg") &&
        !c.querySelector(".bv-chat") &&
        !c.querySelector(".bv-scroll")
    )
    .map((c) => c.querySelector("p")?.textContent);
  expect(bare, `offerings with no diagram or transcript: ${bare.join(", ")}`).toEqual([]);
});
