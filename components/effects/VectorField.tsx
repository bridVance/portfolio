"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * The vector field, as scene objects rather than a canvas of its own.
 *
 * It renders inside the hero shard's scene so the two share one WebGL context,
 * one render loop and — the point of it — one transform: the field cannot drift
 * out of step with the shard because the same group turns both. Two canvases
 * could never manage that, since each gets its own camera and pointer frame.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;
  uniform vec2 uDepth;
  attribute float aPhase;
  varying float vGrad;
  varying float vDepth;

  void main() {
    // Each point breathes along its own radius, out of step with its
    // neighbours, so the shell shimmers instead of pulsing as one body.
    float d = sin(uTime * 0.55 + aPhase) * 0.06;
    vec3 p = position * (1.0 + d);

    vec4 view = modelViewMatrix * vec4(p, 1.0);
    // Screen-vertical 0..1 in view space, so the gradient holds still while the
    // field turns — the same "light from above" read as the shard.
    vGrad = clamp(view.y * 0.42 + 0.5, 0.0, 1.0);
    // 0 at the near face, 1 at the far one. Without this the shell reads as a
    // flat tangle: every filament equally present, so nothing sits behind.
    // The range is passed in, since it follows the host camera and scale.
    vDepth = clamp((-view.z - uDepth.x) / (uDepth.y - uDepth.x), 0.0, 1.0);
    gl_Position = projectionMatrix * view;
    // gl_PointSize is in DEVICE pixels, so the DPR has to be applied by hand or
    // the dots shrink on retina.
    gl_PointSize = uSize * uScale * (10.0 / -view.z);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vGrad;
  varying float vDepth;

  // The shard's sunset ramp: violet -> rose -> coral -> gold -> yellow.
  vec3 gradient(float t) {
    vec3 violet = vec3(0.60, 0.42, 1.00);
    vec3 rose   = vec3(1.00, 0.45, 0.72);
    vec3 coral  = vec3(1.00, 0.48, 0.42);
    vec3 gold   = vec3(1.00, 0.75, 0.35);
    vec3 yellow = vec3(1.00, 0.93, 0.52);
    if (t < 0.25) return mix(violet, rose,  t / 0.25);
    if (t < 0.50) return mix(rose,   coral, (t - 0.25) / 0.25);
    if (t < 0.75) return mix(coral,  gold,  (t - 0.50) / 0.25);
    return mix(gold, yellow, (t - 0.75) / 0.25);
  }

  void main() {
    // Round the square point sprite off and feather its edge.
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(gradient(vGrad), edge * mix(1.0, 0.25, vDepth));
  }
`;

const lineVertexShader = /* glsl */ `
  uniform vec2 uDepth;
  varying float vDepth;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vDepth = clamp((-view.z - uDepth.x) / (uDepth.y - uDepth.x), 0.0, 1.0);
    gl_Position = projectionMatrix * view;
  }
`;

const lineFragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vDepth;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity * mix(1.0, 0.18, vDepth));
  }
`;

/** Deterministic PRNG, so the field is the same shell on every load. */
function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Points spread over a sphere by the Fibonacci spiral, nudged off the shell so
 * it reads as a cloud rather than a ball, with every pair closer than `link`
 * joined. Neighbours are bucketed on a grid first: the naive all-pairs sweep is
 * O(n squared).
 *
 * `link` wants to sit just above the average point spacing (~sqrt(4pi/n)) —
 * below it almost nothing connects and the field falls apart into loose dots.
 */
function buildField(count: number, link: number) {
  const rand = makeRand(90210);
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const jitter = 0.86 + rand() * 0.28;
    pts.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(
        jitter
      )
    );
  }

  const cell = link;
  const buckets = new Map<string, number[]>();
  pts.forEach((p, i) => {
    const k = `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)},${Math.floor(p.z / cell)}`;
    const b = buckets.get(k);
    if (b) b.push(i);
    else buckets.set(k, [i]);
  });

  const links: number[] = [];
  const link2 = link * link;
  pts.forEach((p, i) => {
    const cx = Math.floor(p.x / cell);
    const cy = Math.floor(p.y / cell);
    const cz = Math.floor(p.z / cell);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const b = buckets.get(`${cx + dx},${cy + dy},${cz + dz}`);
          if (!b) continue;
          for (const j of b) {
            // j > i keeps each pair once and skips the self-comparison.
            if (j <= i) continue;
            if (p.distanceToSquared(pts[j]) < link2) links.push(i, j);
          }
        }
      }
    }
  });

  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  pts.forEach((p, i) => {
    positions.set([p.x, p.y, p.z], i * 3);
    phases[i] = rand() * Math.PI * 2;
  });

  const linePositions = new Float32Array(links.length * 3);
  links.forEach((idx, n) =>
    linePositions.set([pts[idx].x, pts[idx].y, pts[idx].z], n * 3)
  );

  return { positions, phases, linePositions };
}

/**
 * The field's meshes. The host owns the transform and the clock: it turns the
 * group these sit in, and advances `uTime` / `uScale` on the material handed
 * back through `materialRef`.
 */
export function VectorFieldObjects({
  count,
  link,
  filament,
  depth,
  materialRef,
}: {
  count: number;
  link: number;
  filament: string;
  /** Near and far view-space distance, from the host camera and this scale. */
  depth: readonly [number, number];
  materialRef: React.RefObject<THREE.ShaderMaterial | null>;
}) {
  const field = useMemo(() => buildField(count, link), [count, link]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1.9 },
      uScale: { value: 1 },
      uDepth: { value: new THREE.Vector2(depth[0], depth[1]) },
    }),
    [depth]
  );

  const lineUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(filament) },
      uOpacity: { value: 0.62 },
      uDepth: { value: new THREE.Vector2(depth[0], depth[1]) },
    }),
    [filament, depth]
  );

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.linePositions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
          <bufferAttribute attach="attributes-aPhase" args={[field.phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </>
  );
}
