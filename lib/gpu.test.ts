import { vi } from "vitest";
import { getGpuTier, createFpsGuard, detectGpuEnv, type GpuEnv } from "./gpu";

test("detectGpuEnv probes a WebGL2 context at most once across many calls", () => {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);

  const a = detectGpuEnv();
  const b = detectGpuEnv();
  const c = detectGpuEnv();

  const webgl2Probes = getContext.mock.calls.filter((call) => call[0] === "webgl2").length;
  expect(webgl2Probes).toBeLessThanOrEqual(1);
  // the cached static half stays identical call-to-call
  expect(b.webgl2).toBe(a.webgl2);
  expect(c.smallViewport).toBe(a.smallViewport);

  getContext.mockRestore();
});

const base: GpuEnv = {
  webgl2: true,
  reducedMotion: false,
  saveData: false,
  deviceMemory: undefined,
  coarsePointer: false,
  smallViewport: false,
};

test("high: webgl2, no flags, memory unset", () => {
  expect(getGpuTier(base)).toBe("high");
});

test("low: no webgl2", () => {
  expect(getGpuTier({ ...base, webgl2: false })).toBe("low");
});

test("low: reduced motion", () => {
  expect(getGpuTier({ ...base, reducedMotion: true })).toBe("low");
});

test("low: save-data", () => {
  expect(getGpuTier({ ...base, saveData: true })).toBe("low");
});

test("low: deviceMemory 4", () => {
  expect(getGpuTier({ ...base, deviceMemory: 4 })).toBe("low");
});

test("mid: deviceMemory 6", () => {
  expect(getGpuTier({ ...base, deviceMemory: 6 })).toBe("mid");
});

test("mid: coarse pointer on a small viewport", () => {
  expect(getGpuTier({ ...base, coarsePointer: true, smallViewport: true })).toBe("mid");
});

test("high: deviceMemory 8", () => {
  expect(getGpuTier({ ...base, deviceMemory: 8 })).toBe("high");
});

test("fps guard fires onFail once when frames are slow", () => {
  let fails = 0;
  const g = createFpsGuard({ sampleMs: 100, minFps: 30, onFail: () => (fails += 1) });
  // 5 frames, 50ms apart => 20fps, below 30
  [0, 50, 100, 150, 200].forEach((t) => g.frame(t));
  expect(fails).toBe(1);
  g.frame(250);
  expect(fails).toBe(1);
});

test("fps guard does not fire when frames are fast", () => {
  let fails = 0;
  const g = createFpsGuard({ sampleMs: 100, minFps: 30, onFail: () => (fails += 1) });
  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].forEach((t) => g.frame(t));
  expect(fails).toBe(0);
});
