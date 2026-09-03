import { render, screen } from "@testing-library/react";
import type React from "react";
import { EffectBoundary } from "./EffectBoundary";

function Boom(): React.JSX.Element {
  throw new Error("gpu blew up");
}

test("renders fallback when a child throws", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <EffectBoundary fallback={<div>poster</div>}>
      <Boom />
    </EffectBoundary>
  );
  expect(screen.getByText("poster")).toBeInTheDocument();
  spy.mockRestore();
});

test("renders children when nothing throws", () => {
  render(
    <EffectBoundary fallback={<div>poster</div>}>
      <div>live effect</div>
    </EffectBoundary>
  );
  expect(screen.getByText("live effect")).toBeInTheDocument();
});
