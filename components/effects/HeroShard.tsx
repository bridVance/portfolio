"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGpuTier } from "@/lib/gpu";

/**
 * Home-hero centrepiece: a faceted shard with a custom unlit surface — navy
 * body, a BridVance-blue Fresnel rim that rides the edges as it turns, and a
 * low-frequency vertex breathe. No lights, no env-map, no transmission, so it
 * stays cheap enough for the `mid` tier.
 *
 * Only ever mounted via `dynamicEffect` (minTier "mid"): `low` tier, no-WebGL
 * and save-data get the static poster instead, and the island's FPS guard swaps
 * to the poster if this runs slow. Reduced-motion → one frozen frame.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBreathe;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    // Cheap low-frequency displacement along the normal — the shard "breathes".
    float d =
      sin(position.x * 3.0 + uTime) +
      sin(position.y * 3.1 + uTime * 1.3) +
      sin(position.z * 2.7 + uTime * 0.7);
    vec3 displaced = position + normal * d * 0.045 * uBreathe;

    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uBody;
  uniform vec3 uRim;
  uniform float uFresnelPower;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    // Flat per-facet normal from screen-space derivatives so the facets read.
    vec3 flatN = normalize(cross(dFdx(vViewDir), dFdy(vViewDir)));
    float facet = 0.5 + 0.5 * dot(flatN, normalize(vec3(0.4, 0.7, 0.6)));

    float fres = pow(
      1.0 - clamp(dot(normalize(vNormalW), vViewDir), 0.0, 1.0),
      uFresnelPower
    );

    vec3 col = mix(uBody * (0.55 + 0.45 * facet), uRim, fres);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const damp = (current: number, target: number, rate: number) =>
  current + (target - current) * rate;

function Shard({ detail, reduced }: { detail: number; reduced: boolean }) {
  const spin = useRef<THREE.Group>(null); // continuous auto-rotation
  const lean = useRef<THREE.Group>(null); // pointer parallax tilt + drift
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.35, detail);
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
        pos.getX(i) + rand() * 0.22,
        pos.getY(i) + rand() * 0.22,
        pos.getZ(i) + rand() * 0.22
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, [detail]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBreathe: { value: reduced ? 0 : 1 },
      uBody: { value: new THREE.Color("#111c3d") },
      uRim: { value: new THREE.Color("#3b82f6") },
      uFresnelPower: { value: 2.4 },
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
      // Pointer is -1..1 across the canvas; lean a few degrees toward it.
      const rate = 1 - Math.pow(0.001, dt);
      lean.current.rotation.x = damp(lean.current.rotation.x, state.pointer.y * -0.18, rate);
      lean.current.rotation.y = damp(lean.current.rotation.y, state.pointer.x * 0.22, rate);
      lean.current.position.x = damp(lean.current.position.x, state.pointer.x * 0.15, rate);
      lean.current.position.y = damp(lean.current.position.y, state.pointer.y * 0.1, rate);
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

  return (
    <div className="h-full w-full" aria-hidden>
      <Canvas
        dpr={high ? [1, 2] : [1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 4.2], fov: 34 }}
        gl={{ antialias: high, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <color attach="background" args={["#080b14"]} />
        <Shard detail={high ? 1 : 0} reduced={reduced} />
      </Canvas>
    </div>
  );
}
