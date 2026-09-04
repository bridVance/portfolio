"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGpuTier } from "@/lib/gpu";

/**
 * Home-hero centrepiece: a faceted shard with a custom unlit surface — an
 * iridescent spectral coating that shifts hue per facet, toward the silhouette,
 * and slowly over time, plus a pearly edge sheen and a low-frequency vertex
 * breathe. No lights, no env-map, no transmission, so it stays cheap enough for
 * the `mid` tier.
 *
 * Only ever mounted via `dynamicEffect` (minTier "mid"): `low` tier, no-WebGL
 * and save-data get the static poster instead, and the island's FPS guard swaps
 * to the poster if this runs slow. Reduced-motion → one frozen frame (hue drift
 * is driven by `uTime`, which stops advancing, so the shard holds one colour).
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathe;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vGrad;

  void main() {
    // Cheap low-frequency displacement along the normal — the shard "breathes".
    float d =
      sin(position.x * 3.0 + uTime) +
      sin(position.y * 3.1 + uTime * 1.3) +
      sin(position.z * 2.7 + uTime * 0.7);
    vec3 displaced = position + normal * d * 0.045 * uBreathe;

    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vec4 view = viewMatrix * world;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    // Screen-vertical 0..1 (bright at the top). View-space, so it holds still
    // as the shard spins — the gradient reads as light from above.
    vGrad = clamp(view.y * 0.42 + 0.5, 0.0, 1.0);
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uFresnelPower;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vGrad;

  // Vertical sunset ramp: violet at the base, up through pink and coral to a
  // bright warm yellow at the top.
  vec3 gradient(float t) {
    vec3 c0 = vec3(0.60, 0.42, 1.00); // violet
    vec3 c1 = vec3(1.00, 0.44, 0.72); // rose
    vec3 c2 = vec3(1.00, 0.56, 0.34); // coral
    vec3 c3 = vec3(1.00, 0.80, 0.26); // gold
    vec3 c4 = vec3(1.00, 0.93, 0.52); // bright yellow
    if (t < 0.25) return mix(c0, c1, t / 0.25);
    if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);
    if (t < 0.75) return mix(c2, c3, (t - 0.50) / 0.25);
    return mix(c3, c4, (t - 0.75) / 0.25);
  }

  void main() {
    vec3 v = normalize(vViewDir);

    // Flat per-facet normal from screen-space derivatives so the facets read.
    vec3 flatN = normalize(cross(dFdx(v), dFdy(v)));
    float facet = 0.5 + 0.5 * dot(flatN, normalize(vec3(0.35, 0.75, 0.55)));

    float fres = pow(
      1.0 - clamp(dot(normalize(vNormalW), v), 0.0, 1.0),
      uFresnelPower
    );

    // Vertical gradient, nudged per facet so neighbouring faces separate.
    vec3 col = gradient(clamp(vGrad + (facet - 0.5) * 0.14, 0.0, 1.0));

    // Facet shading keeps the form legible.
    col *= 0.74 + 0.26 * facet;

    // Deep violet gem edge so the shard stands hard off the light page.
    col = mix(col, vec3(0.42, 0.24, 0.52), fres * 0.42);

    // Bright glints on the faces squarest to the key direction.
    col += smoothstep(0.83, 1.0, facet) * 0.16;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

const damp = (current: number, target: number, rate: number) =>
  current + (target - current) * rate;

function Shard({ detail, reduced }: { detail: number; reduced: boolean }) {
  const spin = useRef<THREE.Group>(null); // continuous auto-rotation
  const lean = useRef<THREE.Group>(null); // pointer parallax tilt + drift
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.0, detail);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    // Deterministic per-vertex jitter for an irregular, "cut" silhouette.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296 - 0.5;
    };
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        pos.getX(i) + rand() * 0.14,
        pos.getY(i) + rand() * 0.14,
        pos.getZ(i) + rand() * 0.14
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, [detail]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBreathe: { value: reduced ? 0 : 1 },
      uFresnelPower: { value: 2.6 },
    }),
    [reduced]
  );

  useFrame((state, delta) => {
    if (reduced) return;
    const dt = Math.min(delta, 0.05); // clamp on tab-refocus / long frames

    if (spin.current) {
      spin.current.rotation.y += dt * 0.18;
      spin.current.rotation.x += dt * 0.045;
    }
    if (lean.current) {
      // Pointer is -1..1 across the canvas; lean a few degrees toward it and
      // drift a touch — kept small so the shard stays comfortably framed.
      const rate = 1 - Math.pow(0.001, dt);
      lean.current.rotation.x = damp(lean.current.rotation.x, state.pointer.y * -0.16, rate);
      lean.current.rotation.y = damp(lean.current.rotation.y, state.pointer.x * 0.2, rate);
      lean.current.position.x = damp(lean.current.position.x, state.pointer.x * 0.08, rate);
      lean.current.position.y = damp(lean.current.position.y, state.pointer.y * 0.06, rate);
    }
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <group ref={lean}>
      <group ref={spin}>
        <mesh geometry={geometry}>
          <shaderMaterial
            ref={mat}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>
      </group>
    </group>
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function HeroShard() {
  const tier = useGpuTier();
  const high = tier === "high";
  const reduced = prefersReducedMotion();

  const [up, setUp] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setUp(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="h-full w-full transition-opacity duration-700 ease-out motion-reduce:transition-none"
      style={{ opacity: up || reduced ? 1 : 0 }}
      aria-hidden
    >
      <Canvas
        dpr={high ? [1, 2] : [1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 6], fov: 34 }}
        gl={{ antialias: high, powerPreference: "high-performance", alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Shard detail={high ? 1 : 0} reduced={reduced} />
      </Canvas>
    </div>
  );
}
