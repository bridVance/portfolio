import { render, screen } from "@testing-library/react";

// Force the low tier so the island renders its poster and never imports the
// R3F effect (jsdom has no WebGL). createFpsGuard is stubbed — the sampler only
// runs on the live path, which low tier never reaches. detectGpuEnv/getGpuTier
// are stubbed for the same reason: the headline's ParticleWord reads them, and
// low tier must keep it off so the "no canvas" assertion means what it says.
vi.mock("@/lib/gpu", () => ({
  useGpuTier: () => "low",
  getGpuTier: () => "low",
  detectGpuEnv: () => ({
    webgl2: false,
    reducedMotion: false,
    saveData: false,
    coarsePointer: true,
    smallViewport: true,
  }),
  createFpsGuard: () => ({ frame() {}, stop() {} }),
}));

import { Hero } from "./Hero";

test("renders the hero headline and lede", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    /distinctive front-ends\. automation that actually runs\./i
  );
  expect(
    screen.getByText(/a small studio building web experiences/i)
  ).toBeInTheDocument();
});

test("low GPU tier renders the poster, not a live canvas", () => {
  const { container } = render(<Hero />);
  const img = container.querySelector("img");
  expect(img).not.toBeNull();
  expect(img).toHaveAttribute("src", "/posters/hero-shard.svg");
  expect(container.querySelector("canvas")).toBeNull();
});
