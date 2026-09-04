import { render } from "@testing-library/react";
import { Mark } from "./Mark";

test("renders an svg path, currentColor stroke by default, no gradient", () => {
  const { container } = render(<Mark className="x" />);
  const svg = container.querySelector("svg");
  expect(svg).toHaveClass("x");
  expect(svg).toHaveAttribute("stroke", "currentColor");
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector("path")).not.toBeNull();
  expect(container.querySelector("linearGradient")).toBeNull();
});

test("gradient variant strokes with a url(#…) over a linearGradient", () => {
  const { container } = render(<Mark gradient />);
  expect(container.querySelector("svg")?.getAttribute("stroke")).toMatch(/^url\(#/);
  expect(container.querySelector("linearGradient")).not.toBeNull();
});
