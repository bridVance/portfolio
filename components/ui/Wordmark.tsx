/**
 * The studio name set as a spaced-out mark: wide tracking with a mid dot
 * between letters, the treatment the reference used.
 *
 * The letters are `aria-hidden` and the real name is carried by a visually
 * hidden span. Splitting a word into per-letter elements changes its
 * accessible name — a screen reader would announce "B dot R dot I dot D…" —
 * and the nav wordmark's name is asserted by tests. The dots are separators
 * drawn in CSS, never characters in the text.
 */
const LETTERS = "BRIDVANCE".split("");

export function Wordmark() {
  return (
    <>
      <span className="sr-only">BridVance</span>
      <span aria-hidden className="bv-wordmark font-display">
        {LETTERS.map((c, i) => (
          <span key={`${c}-${i}`}>{c}</span>
        ))}
      </span>
    </>
  );
}
