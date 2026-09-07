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
