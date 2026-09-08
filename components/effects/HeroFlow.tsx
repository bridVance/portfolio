"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGpuTier } from "@/lib/gpu";
import { useTheme } from "@/lib/theme";

/**
 * Hero centrepiece: a particle flow field. Tens of thousands of points are
 * carried through a divergence-light vector field, each one born, drifting
 * outward and fading on its own loop, coloured along the studio's sunset ramp.
 *
 * Every particle's position is a pure function of its seed and the clock —
 * three fixed integration steps in the vertex shader, no feedback textures and
 * no CPU work per frame. That is what lets it run 30k points on a mid-tier GPU:
 * the whole system is one draw call and one buffer that never changes.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;   // device pixel ratio — gl_PointSize is device px
  uniform float uSpread;
  attribute float aPhase;
  varying float vLife;
  varying float vRadial;
  varying float vFade;

  // Layered sinusoids standing in for curl noise: each component is driven by
  // the other two axes, so the field swirls instead of pushing one direction.
  vec3 field(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t)       + cos(p.z * 1.3 - t * 0.8),
      sin(p.z * 1.5 - t * 0.9) + cos(p.x * 1.4 + t * 0.7),
      sin(p.x * 1.6 + t * 0.6) + cos(p.y * 1.2 - t)
    );
  }

  void main() {
    float t = uTime * 0.16;
    float life = fract(aPhase + uTime * 0.05);
    vLife = life;

    vec3 p = position;
    for (int i = 0; i < 3; i++) {
      p += field(p, t) * 0.055 * (0.35 + life);
    }
    // A slow bloom outward over the particle's life, so the cloud breathes.
    p += normalize(position + 1e-4) * life * uSpread;

    vRadial = length(p);
    vec4 view = viewMatrix * modelMatrix * vec4(p, 1.0);

    // Soft radial falloff. Without it the cloud simply stops at the canvas
    // bounds and reads as a rectangle of colour — which is exactly what it did.
    vFade = 1.0 - smoothstep(0.45, 1.15, length(view.xy));

    // sin(life * PI): nothing pops into existence at full size.
    gl_PointSize = uSize * uScale * (10.0 / -view.z) * (0.35 + 0.9 * sin(life * 3.14159));
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform float uAlpha;
  varying float vLife;
  varying float vRadial;
  varying float vFade;

  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d);
    if (r2 > 0.25) discard;              // round sprite, no texture needed
    float soft = smoothstep(0.25, 0.15, r2);

    // Keyed to life, not radius. On radius almost every particle landed in
    // the first half of the ramp, so the gold never appeared and the overlap
    // saturated to one flat red.
    float k = clamp(vLife * 0.78 + vRadial * 0.18, 0.0, 1.0);
    vec3 col = mix(uA, uB, smoothstep(0.0, 0.5, k));
    col = mix(col, uC, smoothstep(0.5, 1.0, k));

    gl_FragColor = vec4(col, soft * sin(vLife * 3.14159) * uAlpha * vFade);
  }
`;

const damp = (current: number, target: number, rate: number) =>
  current + (target - current) * rate;

function Flow({ count, dark }: { count: number; dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const lean = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    // Deterministic, matching the shard's jitter: Math.random during render
    // gives a different cloud on every re-render (and a different one on the
    // server than the client).
    let seed = 20260907;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      // Seed on a shell rather than through the volume: the field pulls points
      // inward as much as out, and a solid ball reads as a blob.
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 0.72 + rand() * 0.5;
      pos[i * 3] = s * Math.cos(a) * r;
      pos[i * 3 + 1] = s * Math.sin(a) * r;
      pos[i * 3 + 2] = u * r;
      phase[i] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 2.6 },
      uScale: { value: 1 },
      uSpread: { value: 0.5 },
      // The hero's own ramp: violet, rose, gold.
      uA: { value: new THREE.Color("#5b21b6") },
      uB: { value: new THREE.Color("#be1558") },
      uC: { value: new THREE.Color("#c2410c") },
      uAlpha: { value: dark ? 0.7 : 0.5 },
    }),
    [dark]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (mat.current) {
      mat.current.uniforms.uTime.value += dt;
      mat.current.uniforms.uScale.value = state.viewport.dpr;
      mat.current.uniforms.uAlpha.value = dark ? 0.7 : 0.5;
    }
    if (group.current) group.current.rotation.y += dt * 0.075;
    if (lean.current) {
      const rate = 1 - Math.pow(0.0015, dt);
      lean.current.rotation.x = damp(lean.current.rotation.x, -state.pointer.y * 0.28, rate);
      lean.current.rotation.y = damp(lean.current.rotation.y, state.pointer.x * 0.34, rate);
    }
  });

  return (
    <group ref={lean}>
      <group ref={group}>
        <points geometry={geometry}>
          <shaderMaterial
            ref={mat}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            // Additive glows on a dark ground and blows out to white on a pale
            // one, so the page decides which it gets.
            blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </points>
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

export default function HeroFlow() {
  const tier = useGpuTier();
  const high = tier === "high";
  const reduced = prefersReducedMotion();
  const { resolved } = useTheme();

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
        // Capped at 1.5 rather than 2. Thousands of soft blended points are
        // fill-rate bound, and fill scales with the square of pixel density —
        // at DPR 2 this costs more than twice what it does at 1.5, for a cloud
        // with no hard edges to sharpen.
        dpr={[1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Flow count={high ? 9000 : 4500} dark={resolved === "dark"} />
      </Canvas>
    </div>
  );
}
