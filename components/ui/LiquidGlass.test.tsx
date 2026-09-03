import { render, screen } from "@testing-library/react";

import { LiquidGlass } from "./LiquidGlass";

test("renders a pure CSS backdrop-filter surface", () => {
  render(<LiquidGlass className="nav">hi</LiquidGlass>);
  const el = screen.getByText("hi");

  // Inspection hook: this component is CSS-only, no live/clone path.
  expect(el).toHaveAttribute("data-glass", "css");

  // The frosted look comes from an inline backdrop-filter blur.
  const backdrop =
    el.style.backdropFilter ||
    el.style.getPropertyValue("backdrop-filter") ||
    el.style.getPropertyValue("-webkit-backdrop-filter");
  expect(backdrop).toContain("blur");

  // Base container classes are always applied and merged with `className`.
  expect(el).toHaveClass("border-b", "border-line", "nav");
});
