import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { dynamicEffect } from "./dynamicEffect";

vi.mock("@/lib/gpu", () => ({ useGpuTier: () => "low" }));

test("low tier renders only the poster, never calls the loader", () => {
  const loader = vi.fn(() =>
    Promise.resolve({ default: () => <div>LIVE</div> })
  );
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/x.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/x.webp"
  );
  expect(loader).not.toHaveBeenCalled();
});
