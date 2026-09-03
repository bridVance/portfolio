import { render, screen, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useGpuTier } from "@/lib/gpu";
import { dynamicEffect } from "./dynamicEffect";

// Mock only useGpuTier — createFpsGuard stays the real implementation so the
// downgrade path is exercised end to end.
vi.mock("@/lib/gpu", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gpu")>();
  return { ...actual, useGpuTier: vi.fn(() => "low") };
});

// IntersectionObserver stub that records every observer, so a test can drive the
// "near" (~200px) gate and the "far" (1-viewport) hysteresis gate independently.
type IOCb = (entries: Array<{ isIntersecting: boolean }>) => void;
let observers: Array<{ cb: IOCb; rootMargin: string }>;

beforeEach(() => {
  observers = [];
  class IO {
    constructor(cb: IOCb, opts?: IntersectionObserverInit) {
      observers.push({ cb, rootMargin: opts?.rootMargin ?? "" });
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", IO);
  try {
    sessionStorage.clear();
  } catch {
    /* jsdom always has it, but be safe */
  }
  vi.mocked(useGpuTier).mockReturnValue("low");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const isNear = (rm: string) => rm === "200px";
const isFar = (rm: string) => rm.includes("100%");

function fireIO(match: (rm: string) => boolean, isIntersecting: boolean) {
  for (const o of observers) {
    if (match(o.rootMargin)) act(() => o.cb([{ isIntersecting }]));
  }
}

function makeLoader(text = "LIVE EFFECT") {
  return vi.fn(() => Promise.resolve({ default: () => <div>{text}</div> }));
}

test("low tier renders only the poster and never calls the loader, even in view", () => {
  vi.mocked(useGpuTier).mockReturnValue("low");
  const loader = makeLoader();
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/x.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  fireIO(isNear, true);
  fireIO(isFar, true);
  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/x.webp"
  );
  expect(loader).not.toHaveBeenCalled();
});

test("effect unmounts and the poster returns once the island scrolls clearly past", async () => {
  vi.mocked(useGpuTier).mockReturnValue("high");
  const loader = makeLoader();
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/a.webp", width: 800, height: 450 },
  });
  render(<Effect />);

  fireIO(isNear, true);
  fireIO(isFar, true);
  expect(loader).toHaveBeenCalledTimes(1);
  await screen.findByText("LIVE EFFECT");

  // Hysteresis: leaving the ~200px margin but still within one viewport keeps
  // the effect mounted.
  fireIO(isNear, false);
  expect(screen.queryByText("LIVE EFFECT")).not.toBeNull();

  // Clearly past (also outside the 1-viewport margin) -> unmount, poster back.
  fireIO(isFar, false);
  await waitFor(() => expect(screen.queryByText("LIVE EFFECT")).toBeNull());
  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/a.webp"
  );
});

test("a slow frame rate swaps to the poster and sets the session downgrade flag", async () => {
  vi.mocked(useGpuTier).mockReturnValue("high");

  // ~20fps (50ms/frame) — below the guard's 24fps default threshold.
  let t = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    t += 50;
    if (t <= 6000) queueMicrotask(() => cb(t));
    return t;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});

  const loader = makeLoader();
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/slow.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  fireIO(isNear, true);

  await waitFor(() =>
    expect(sessionStorage.getItem("bv-fx-downgraded:/posters/slow.webp")).toBe("1")
  );
  await waitFor(() => expect(screen.queryByText("LIVE EFFECT")).toBeNull());
  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/slow.webp"
  );
});

test("a pre-set session downgrade flag renders the poster and never calls the loader", () => {
  vi.mocked(useGpuTier).mockReturnValue("high");
  sessionStorage.setItem("bv-fx-downgraded:/posters/c.webp", "1");

  const loader = makeLoader();
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/c.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  fireIO(isNear, true);
  fireIO(isFar, true);

  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/c.webp"
  );
  expect(loader).not.toHaveBeenCalled();
});

test("a throwing effect falls back to the poster plus an unobtrusive mono note", async () => {
  vi.mocked(useGpuTier).mockReturnValue("high");
  const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const loader = vi.fn(() =>
    Promise.resolve({
      default: () => {
        throw new Error("effect blew up");
      },
    })
  );
  const Effect = dynamicEffect(loader, {
    poster: { src: "/posters/err.webp", width: 800, height: 450 },
  });
  render(<Effect />);
  fireIO(isNear, true);

  const note = await screen.findByText("effect unavailable");
  expect(note).toHaveClass("font-mono");
  expect(note).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
    "src",
    "/posters/err.webp"
  );
  errSpy.mockRestore();
});
