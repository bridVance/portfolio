"use client";

import { useEffect, useRef, useState } from "react";
import { createFpsGuard, detectGpuEnv, getGpuTier } from "@/lib/gpu";

type Particle = {
  /** Home position, in device pixels within the canvas. */
  hx: number;
  hy: number;
  /** Orbit radius, phase and angular speed — the drift around home. */
  amp: number;
  phase: number;
  speed: number;
  radius: number;
  /** Live offset from the cursor push, decayed each frame. */
  ox: number;
  oy: number;
  /** Where this dot flies in from, and how long it waits before setting off. */
  sx: number;
  sy: number;
  delay: number;
};

/** Assembly: each dot's own flight, the left-to-right sweep, and its jitter. */
const INTRO_MS = 750;
const SWEEP_MS = 420;
const JITTER_MS = 160;
const INTRO_TOTAL = INTRO_MS + SWEEP_MS + JITTER_MS;

/**
 * Sampling grid and dot size both scale with the font, so the word looks the
 * same at 36px on a phone as at 60px on a desktop.
 *
 * Legibility comes from a fine, dense grid rather than fat dots: big dots on a
 * coarse grid read as blobs and lose the letterform. Dots are drawn a little
 * wider than the spacing (DOT_SCALE > 0.5) so neighbours just touch, which
 * holds the strokes solid while keeping the stipple visible.
 */
const STEP_EM = 0.025;
const MIN_STEP = 1.3;
const DOT_SCALE = 0.62;
const MAX_PARTICLES = 4000;

/**
 * Samples the word as it is actually rendered — same font, weight and size —
 * and returns one particle per inked grid cell. Most particles get a small
 * orbit so the word holds its shape; a long tail get a much larger one, which
 * is what throws the loose specks off the edges.
 */
function sample(
  text: string,
  font: string,
  width: number,
  height: number,
  dpr: number,
  padX: number,
  padY: number,
  fontSize: number
): Particle[] {
  const off = document.createElement("canvas");
  off.width = Math.ceil(width * dpr);
  off.height = Math.ceil(height * dpr);
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.scale(dpr, dpr);
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  // Font-box ascent, not the tight glyph ascent: the canvas is positioned
  // against a Range rect, which spans the font's full ascent/descent. Measuring
  // from the glyph top instead would drop the ink by the difference — a word
  // with no capitals or descenders would float above its own baseline.
  const m = ctx.measureText(text);
  const ascent = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent;
  ctx.fillText(text, padX, padY + ascent);

  const { data } = ctx.getImageData(0, 0, off.width, off.height);
  const stepCss = Math.max(MIN_STEP, fontSize * STEP_EM);
  // Step as a float and floor only when indexing. Rounding the step to whole
  // device pixels would land differently per DPR — a 1.5px grid becomes 2px at
  // 1x but 1.5px at 2x — leaving the same word noticeably denser on a retina
  // screen than on a standard one.
  const step = Math.max(1, stepCss * dpr);
  const out: Particle[] = [];

  for (let fy = 0; fy < off.height; fy += step) {
    const y = Math.floor(fy);
    for (let fx = 0; fx < off.width; fx += step) {
      const x = Math.floor(fx);
      // Alpha channel only: the glyph was filled opaque white on transparent.
      if (data[(y * off.width + x) * 4 + 3] < 128) continue;
      const stray = Math.random();
      const s2 = stray * stray;
      const angle = Math.random() * Math.PI * 2;
      // Kept within the canvas padding below — a dot that starts outside the
      // canvas is simply clipped, and the word appears to grow out of its own
      // edges instead of assembling from a cloud.
      const flight = (0.15 + Math.random() * 0.5) * fontSize * dpr;
      out.push({
        hx: x,
        hy: y,
        // The particles *are* the word once the real text fades, so they have
        // to stay legible: a 4th-power curve keeps the bulk within a fraction
        // of the grid and lets only the tail wander off as loose specks.
        amp: (0.15 + s2 * s2 * 2.5) * stepCss * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        radius: (stray > 0.85 ? DOT_SCALE * 0.6 : DOT_SCALE) * stepCss * dpr,
        ox: 0,
        oy: 0,
        // Fly in from a random bearing about a word-height away, and set off
        // in a left-to-right sweep so the word assembles the way it is read.
        sx: x + Math.cos(angle) * flight,
        sy: y + Math.sin(angle) * flight,
        delay: (x / off.width) * SWEEP_MS + Math.random() * JITTER_MS,
      });
    }
  }

  if (out.length <= MAX_PARTICLES) return out;
  // Thin evenly rather than truncating, which would lop off a whole edge.
  const keep = out.length / MAX_PARTICLES;
  return out.filter((_, i) => Math.floor(i % keep) === 0).slice(0, MAX_PARTICLES);
}

/**
 * One word of the hero headline, redrawn as drifting particles.
 *
 * The word itself stays in the DOM and is server-rendered — it carries the
 * layout, the accessible text and the LCP paint. Only once the particles are
 * built and the first frame is on screen does the real text fade out beneath
 * the canvas, so a visitor never waits on this and never sees a gap. If
 * anything disqualifies the effect — reduced motion, save-data, ≤4 GB of RAM,
 * no 2D context, a font that never loads, or a measured frame rate under the
 * guard's floor — the canvas is dropped and the plain word simply stays.
 *
 * The loop is stopped whenever the word is off screen.
 */
export function ParticleWord({ children }: { children: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    // Reuse the site's single notion of "too weak for effects" rather than a
    // parallel one: it already covers reduced motion, save-data and ≤4 GB, and
    // a device with no WebGL2 at all is old enough not to want a second canvas
    // painting every frame either.
    if (getGpuTier(detectGpuEnv()) === "low") return;
    // Client-only capability probe: deviceMemory / saveData / matchMedia don't
    // exist during SSR, so the effect is rendered off and switched on after
    // mount. External-system synchronization, not derivable state.
    // oxlint-disable-next-line react/set-state-in-effect
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let dpr = 1;
    let colour = "#000";
    let colourAge = 0;
    let cancelled = false;
    let visible = true;
    let handedOver = false;
    // Cursor position in canvas device px, parked far off-canvas when away.
    let pointerX = -1e6;
    let pointerY = -1e6;
    let pushRadius = 0;
    let pushStrength = 0;
    let introStart = performance.now();

    const guard = createFpsGuard({
      minFps: 24,
      onFail: () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        setPainted(false);
        setActive(false);
      },
    });

    const build = () => {
      // The tight glyph box, not the span's line box — the word may sit inside
      // generous leading, and the canvas should hug the letters.
      const range = document.createRange();
      range.selectNodeContents(textEl);
      const text = range.getBoundingClientRect();
      const host = wrap.getBoundingClientRect();
      if (!text.width || !text.height) return false;

      const style = getComputedStyle(textEl);
      const fontSize = parseFloat(style.fontSize);
      // Roomy enough to hold the fly-in cloud (max 0.65em) plus the drift, so
      // no dot is ever clipped mid-assembly. The canvas is transparent and
      // pointer-events:none, so overlapping the neighbouring words is free.
      const padX = fontSize * 0.7;
      const padY = fontSize * 0.8;
      const w = text.width + padX * 2;
      const h = text.height + padY * 2;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.left = `${text.left - host.left - padX}px`;
      canvas.style.top = `${text.top - host.top - padY}px`;

      colour = style.color;
      particles = sample(
        children,
        `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
        w,
        h,
        dpr,
        padX,
        padY,
        fontSize
      );
      pushRadius = fontSize * 0.75 * dpr;
      pushStrength = fontSize * 0.06 * dpr;
      introStart = performance.now();
      return particles.length > 0;
    };

    const draw = (now: number) => {
      if (++colourAge > 30) {
        colourAge = 0;
        colour = getComputedStyle(textEl).color;
      }

      const t = now / 1000;
      const age = now - introStart;
      const settled = age >= INTRO_TOTAL;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Hand over only once real pixels are down. A tab opened in the
      // background freezes rAF, and fading the word out before then would
      // leave the headline with a hole in it until the tab was focused.
      if (!handedOver) {
        handedOver = true;
        setPainted(true);
      }
      ctx.fillStyle = colour;
      // One path for every dot, filled once: at this count the per-dot fill()
      // calls would cost far more than the arcs themselves.
      ctx.beginPath();
      const r2 = pushRadius * pushRadius;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const a = t * p.speed + p.phase;
        let x = p.hx + Math.cos(a) * p.amp;
        let y = p.hy + Math.sin(a * 1.3) * p.amp;

        // The cursor shoulders dots aside, and they ease back once it leaves.
        // Squared distance first, so the sqrt only runs for dots in range.
        const dx = x - pointerX;
        const dy = y - pointerY;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const force = (1 - d / pushRadius) * pushStrength;
          p.ox += (dx / d) * force;
          p.oy += (dy / d) * force;
        }
        p.ox *= 0.86;
        p.oy *= 0.86;
        x += p.ox;
        y += p.oy;

        // Assembly: ease from the dot's flight-in point to where it belongs.
        // Skipped outright once the whole word has landed.
        if (!settled) {
          const prog = (age - p.delay) / INTRO_MS;
          if (prog <= 0) {
            x = p.sx;
            y = p.sy;
          } else if (prog < 1) {
            const inv = 1 - prog;
            const e = 1 - inv * inv * inv;
            x = p.sx + (x - p.sx) * e;
            y = p.sy + (y - p.sy) * e;
          }
        }

        ctx.moveTo(x + p.radius, y);
        ctx.arc(x, y, p.radius, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const frame = (now: number) => {
      if (cancelled) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      guard.frame(now);
      draw(now);
    };

    /**
     * Rebuild and immediately repaint. Setting `canvas.width` wipes the canvas,
     * so deferring the redraw to the next frame leaves the word missing in the
     * gap — invisible text, not just a stutter — for as long as frames are not
     * being served. Painting synchronously closes that window entirely.
     */
    const rebuild = () => {
      if (cancelled) return false;
      if (!build()) return false;
      draw(performance.now());
      return true;
    };

    const start = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* no Font Loading API — the face is whatever is already resolved */
      }
      if (!rebuild()) {
        if (!cancelled) setActive(false);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    void start();

    // Tracked on the window rather than the canvas: the canvas is
    // pointer-events:none (it must not swallow text selection or the h1), and
    // dots should already be moving as the cursor approaches, not only once it
    // is over them. Passive, and only stores two numbers per move.
    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      pointerX = ((e.clientX - r.left) / r.width) * canvas.width;
      pointerY = ((e.clientY - r.top) / r.height) * canvas.height;
    };
    const onPointerGone = () => {
      pointerX = -1e6;
      pointerY = -1e6;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onPointerGone);

    // Replay the assembly on returning to the tab. rAF is frozen while hidden,
    // so without this the word would simply still be sitting there; restarting
    // the clock means coming back to the site always shows it build itself.
    const onVisibility = () => {
      if (document.visibilityState === "visible") introStart = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
          });
    io?.observe(wrap);

    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            rebuild();
          });
    ro?.observe(wrap);

    return () => {
      cancelled = true;
      guard.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onPointerGone);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      ro?.disconnect();
    };
  }, [active, children]);

  return (
    <span ref={wrapRef} className="bv-pw">
      <span ref={textRef} className="bv-pw__text" data-hidden={painted || undefined}>
        {children}
      </span>
      {active ? (
        <canvas ref={canvasRef} aria-hidden className="bv-pw__canvas" />
      ) : null}
    </span>
  );
}
