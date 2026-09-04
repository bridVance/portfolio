import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

function mockMatchMedia(match: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: q.includes("reduced-motion") ? match : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

test("returns true after mount when the query matches", () => {
  mockMatchMedia(true);
  const { result } = renderHook(() => usePrefersReducedMotion());
  expect(result.current).toBe(true);
});

test("returns false after mount when the query does not match", () => {
  mockMatchMedia(false);
  const { result } = renderHook(() => usePrefersReducedMotion());
  expect(result.current).toBe(false);
});
