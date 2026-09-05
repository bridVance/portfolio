import { render, screen } from "@testing-library/react";

// detectGpuEnv caches its probe for the life of the module (deliberately — it
// creates a WebGL context, and browsers cap those), so the environment has to
// be controlled here rather than by poking at navigator.
const detectGpuEnv = vi.fn();
vi.mock("@/lib/gpu", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gpu")>()),
  detectGpuEnv: () => detectGpuEnv(),
}));

import { ParticleWord } from "./ParticleWord";

const CAPABLE = {
  webgl2: true,
  reducedMotion: false,
  saveData: false,
  deviceMemory: 8,
  coarsePointer: false,
  smallViewport: false,
};

beforeEach(() => detectGpuEnv.mockReturnValue(CAPABLE));

test("the word is real text, so the headline reads correctly with or without the effect", () => {
  render(<ParticleWord>front-ends</ParticleWord>);
  expect(screen.getByText("front-ends")).toBeInTheDocument();
});

test("the word is never hidden before the canvas has actually painted", () => {
  const { container } = render(<ParticleWord>front-ends</ParticleWord>);
  // jsdom provides no 2D context, so the effect bails — and the word must stay
  // visible. This is the failure mode that would blank the headline.
  expect(container.querySelector(".bv-pw__text")).not.toHaveAttribute("data-hidden");
});

test.each([
  ["reduced motion", { reducedMotion: true }],
  ["save-data", { saveData: true }],
  ["a low-memory device", { deviceMemory: 4 }],
  ["a device with no WebGL2", { webgl2: false }],
])("skips the canvas entirely under %s", (_label, override) => {
  detectGpuEnv.mockReturnValue({ ...CAPABLE, ...override });
  const { container } = render(<ParticleWord>front-ends</ParticleWord>);
  expect(container.querySelector("canvas")).toBeNull();
  expect(screen.getByText("front-ends")).toBeInTheDocument();
});

test("a device that reports no memory figure is still allowed the effect", () => {
  detectGpuEnv.mockReturnValue({ ...CAPABLE, deviceMemory: undefined });
  const { container } = render(<ParticleWord>front-ends</ParticleWord>);
  expect(container.querySelector("canvas")).not.toBeNull();
});
