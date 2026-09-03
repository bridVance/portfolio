import { render, screen, waitFor } from "@testing-library/react";

const init = vi.fn();
vi.mock("liquid-glass-js", () => ({ default: init, createLiquidGlass: init }));

import { LiquidGlass } from "./LiquidGlass";

beforeEach(() => {
  init.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("falls back to backdrop-filter when displacement is unsupported", () => {
  vi.stubGlobal("CSS", { supports: () => false });
  render(<LiquidGlass className="nav">hi</LiquidGlass>);
  const el = screen.getByText("hi");
  expect(el).toHaveAttribute("data-glass", "fallback");
  const backdrop =
    el.style.backdropFilter ||
    el.style.getPropertyValue("-webkit-backdrop-filter");
  expect(backdrop).toContain("blur");
  expect(init).not.toHaveBeenCalled();
});

test("reverts to the backdrop-filter path when live init throws", async () => {
  vi.stubGlobal("CSS", { supports: () => true });
  init.mockImplementation(() => {
    throw new Error("engine cannot displace the backdrop");
  });
  render(<LiquidGlass>hi</LiquidGlass>);
  const el = screen.getByText("hi");
  await waitFor(() => expect(init).toHaveBeenCalled());
  await waitFor(() => expect(el).toHaveAttribute("data-glass", "fallback"));
  const backdrop =
    el.style.backdropFilter ||
    el.style.getPropertyValue("-webkit-backdrop-filter");
  expect(backdrop).toContain("blur");
});
