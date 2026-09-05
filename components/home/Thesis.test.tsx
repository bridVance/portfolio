import { act, render, screen } from "@testing-library/react";

import { Thesis } from "./Thesis";

test("gives assistive tech one punctuated sentence, not the run-together words", () => {
  render(<Thesis />);
  expect(
    screen.getByText(
      /independent design & automation studio, built with craft\./i
    )
  ).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /what bridvance does/i })).toBeInTheDocument();
});

test("the decorative composition is hidden from assistive tech, so nothing is read twice", () => {
  const { container } = render(<Thesis />);
  const composition = container.querySelector("[aria-hidden]");
  expect(composition).not.toBeNull();
  expect(composition!.querySelectorAll(".bv-word")).toHaveLength(6);
});

test("neither half of the studio is billed as the whole of it", () => {
  const { container } = render(<Thesis />);
  const text = container.textContent ?? "";
  // Design and automation both appear, and the line resolves on a quality
  // rather than on either service — the old copy ended on "automation".
  expect(text).toMatch(/design/i);
  expect(text).toMatch(/automation/i);
  expect(text.trimEnd()).toMatch(/craft\.?$/i);
});

test("the words carry no per-word motion — the bands are the only thing that moves", () => {
  const { container } = render(<Thesis />);
  for (const word of container.querySelectorAll<HTMLElement>(".bv-word")) {
    expect(word.style.transitionDelay).toBe("");
    expect(word.style.transform).toBe("");
  }
});

test("each band carries its own drift distance, alternating direction", () => {
  const { container } = render(<Thesis />);
  const drifts = [...container.querySelectorAll<HTMLElement>(".bv-band")].map(
    (el) => el.style.getPropertyValue("--bv-drift")
  );
  expect(drifts).toEqual(["-80px", "100px", "-60px"]);
});

test("the drift listener attaches only while the section is on screen", () => {
  let fire: (entries: { isIntersecting: boolean }[]) => void = () => {};
  const original = window.IntersectionObserver;
  class FakeObserver {
    constructor(cb: typeof fire) {
      fire = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");

  try {
    render(<Thesis />);
    expect(add).not.toHaveBeenCalledWith("scroll", expect.anything(), expect.anything());

    act(() => fire([{ isIntersecting: true }]));
    expect(add).toHaveBeenCalledWith("scroll", expect.anything(), { passive: true });

    // Scrolled away: nothing keeps listening for a section nobody can see.
    act(() => fire([{ isIntersecting: false }]));
    expect(remove).toHaveBeenCalledWith("scroll", expect.anything());
  } finally {
    add.mockRestore();
    remove.mockRestore();
    window.IntersectionObserver = original;
  }
});

test("without an IntersectionObserver the statement still renders", () => {
  const original = window.IntersectionObserver;
  // @ts-expect-error -- deleting the global is the point of the test
  delete window.IntersectionObserver;
  try {
    const { container } = render(<Thesis />);
    expect(container.querySelectorAll(".bv-word")).toHaveLength(6);
  } finally {
    window.IntersectionObserver = original;
  }
});
