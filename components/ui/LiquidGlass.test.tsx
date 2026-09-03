import { render, screen } from "@testing-library/react";

const init = vi.fn();
vi.mock("liquid-glass-js", () => ({ default: init, createLiquidGlass: init }));

import { LiquidGlass } from "./LiquidGlass";

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
