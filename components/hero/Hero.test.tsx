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
    /ai agents that actually ship\. interfaces that make them usable\./i
  );
  expect(
    screen.getByText(/an independent ai studio/i)
  ).toBeInTheDocument();
});

test("low GPU tier renders the poster, not a live canvas", () => {
  const { container } = render(<Hero />);
  // One island now: the field shares the shard's scene rather than having its
  // own canvas, so there is a single fallback.
  const srcs = [...container.querySelectorAll("img")].map((i) => i.getAttribute("src"));
  expect(srcs).toEqual(["/posters/hero-shard.svg"]);
  expect(container.querySelector("canvas")).toBeNull();
});
