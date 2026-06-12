"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion, isTouchDevice } from "@/lib/gsap";
import { supportsWebGL } from "@/lib/webgl";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uMouseStrength;
  varying vec2 vUv;

  // Simplex 2D noise (Ashima Arts / Stefan Gustavson, MIT)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * snoise(p);
      p = rot * p * 2.0 + 11.5;
      a *= 0.5;
    }
    return v;
  }

  // two ramps over the same value structure: vermillion lean vs wine/rose lean
  vec3 rampWarm(float x) {
    vec3 c = mix(vec3(0.039, 0.039, 0.035), vec3(0.23, 0.022, 0.012), smoothstep(0.08, 0.45, x));
    c = mix(c, vec3(0.66, 0.07, 0.025), smoothstep(0.4, 0.68, x));
    c = mix(c, vec3(1.0, 0.26, 0.1), smoothstep(0.62, 0.92, x));
    c = mix(c, vec3(1.0, 0.45, 0.22), smoothstep(0.95, 1.2, x));
    return c;
  }

  vec3 rampCool(float x) {
    vec3 c = mix(vec3(0.035, 0.03, 0.04), vec3(0.17, 0.012, 0.05), smoothstep(0.08, 0.45, x));
    c = mix(c, vec3(0.52, 0.035, 0.1), smoothstep(0.4, 0.68, x));
    c = mix(c, vec3(0.95, 0.14, 0.18), smoothstep(0.62, 0.92, x));
    c = mix(c, vec3(1.0, 0.45, 0.42), smoothstep(0.95, 1.2, x));
    return c;
  }

  float blob(vec2 p, vec2 c, float r) {
    float d = length(p - c);
    return exp(-(d * d) / (r * r));
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 au = vec2(vUv.x * aspect, vUv.y);
    float t = uTime * 0.08;

    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    vec2 toM = m - au;
    float d = length(toM);
    vec2 dir = toM / max(d, 0.0001);

    // large silk folds
    vec2 fold = vec2(
      fbm(au * 0.55 + vec2(0.0, t)),
      fbm(au * 0.55 + vec2(5.2, 1.3) - t * 0.7)
    ) * 0.42;

    // attraction: pixels sample the field farther from the pointer, so the
    // masses visually converge on it and stretch into taffy cusps
    float pull = exp(-(d * d) / 0.5) * uMouseStrength;
    vec2 velA = vec2(uMouseVel.x * aspect, uMouseVel.y);
    vec2 pw = au + fold - dir * pull * 0.65 - velA * pull * 0.14;

    // a few large drifting masses build the composition over black;
    // radii shrink on portrait screens so black keeps dominating
    float s = clamp(aspect * 0.7, 0.5, 1.0);
    float heat = 0.0;
    heat += 0.95 * blob(pw, vec2(aspect * 0.82 + sin(t * 0.5) * 0.12, 0.78 + cos(t * 0.4) * 0.1), 0.6 * s);
    heat += 0.8 * blob(pw, vec2(aspect * 0.55 + cos(t * 0.6) * 0.22, 0.38 + sin(t * 0.5) * 0.16), 0.42 * s);
    heat += 0.5 * blob(pw, vec2(aspect * 0.16 + sin(t * 0.35) * 0.1, 0.16 + cos(t * 0.55) * 0.1), 0.34 * s);
    // a faint ember hugs the cursor; the pull deformation stays the main event
    heat += 0.35 * blob(au + fold * 0.5, m, 0.3 * s) * uMouseStrength;
    heat = clamp(heat, 0.0, 1.15);

    // slow hue field: some masses lean vermillion, others wine/rose
    float hueN = fbm(au * 0.45 + vec2(7.3, 2.9) + t * 0.8);
    vec3 col = mix(rampCool(heat), rampWarm(heat), clamp(0.5 + hueN * 1.1, 0.0, 1.0));
    // stretched hot edges around the pull blush rose, like the taffy tongues
    col = mix(col, vec3(1.0, 0.42, 0.38), pull * smoothstep(0.3, 0.85, heat) * 0.3);

    gl_FragColor = vec4(col * 0.78, 1.0);
  }
`;

// the field is blurred anyway — render small and let CSS upscale + blur do the softening
const RES_SCALE = 0.4;

export default function HeroGradient({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();

    // no WebGL (e.g. Opera GX with GPU acceleration off): static CSS gradient instead
    let renderer: THREE.WebGLRenderer | null = null;
    if (supportsWebGL()) {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
      } catch {
        renderer = null;
      }
    }
    if (!renderer) {
      mount.classList.add("hero-fallback");
      return () => mount.classList.remove("hero-fallback");
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer.setPixelRatio(1);
    renderer.setSize(mount.clientWidth * RES_SCALE, mount.clientHeight * RES_SCALE);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    // scale past the edges so the blur doesn't show a darkened rim
    canvas.style.filter = "blur(26px)";
    canvas.style.transform = "scale(1.15)";
    mount.appendChild(canvas);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: reduced ? 12 : 0 },
        uRes: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
        uMouse: { value: new THREE.Vector2(0.7, 0.65) },
        uMouseVel: { value: new THREE.Vector2(0, 0) },
        uMouseStrength: { value: 0 },
      },
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);

    // pointer in uv space (origin bottom-left, matching vUv)
    const mouseTarget = new THREE.Vector2(0.7, 0.65);
    const mouseWorld = new THREE.Vector2(0.7, 0.65);
    const velTarget = new THREE.Vector2();
    const vel = new THREE.Vector2();
    let pointerActive = false;
    let lastMove = performance.now();
    const touch = isTouchDevice();
    let strength = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (touch) return;
      const now = performance.now();
      const dt = Math.max(now - lastMove, 8) / 1000;
      lastMove = now;
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      velTarget.set((nx - mouseTarget.x) / dt, (ny - mouseTarget.y) / dt).clampLength(0, 3);
      mouseTarget.set(nx, ny);
      pointerActive = true;
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    let raf = 0;
    let running = true;
    let elapsed = reduced ? 12 : 0;
    let last = performance.now();

    const render = () => {
      const now = performance.now();
      elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      material.uniforms.uTime.value = elapsed;

      if (!pointerActive) {
        // idle drift keeps the field alive without a pointer
        mouseTarget.set(0.5 + Math.sin(elapsed * 0.21) * 0.3, 0.55 + Math.cos(elapsed * 0.17) * 0.25);
      }
      mouseWorld.lerp(mouseTarget, 0.09);
      vel.lerp(velTarget, 0.08);
      velTarget.multiplyScalar(0.92); // decay so the churn settles when the pointer rests
      strength += ((pointerActive ? 1 : 0.55) - strength) * 0.04;
      material.uniforms.uMouse.value.copy(mouseWorld);
      material.uniforms.uMouseVel.value.copy(vel);
      material.uniforms.uMouseStrength.value = strength;

      renderer.render(scene, camera);
      if (running && !reduced) raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(render);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    raf = requestAnimationFrame(render);

    // pause when hero is offscreen or tab hidden
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    observer.observe(mount);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      renderer.setSize(mount.clientWidth * RES_SCALE, mount.clientHeight * RES_SCALE);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      material.uniforms.uRes.value.set(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(canvas);
    };
  }, []);

  // `isolate` contains the grain's blend mode to this subtree — without it Safari's
  // compositor can corrupt unrelated fixed layers (the nav) when blending
  return (
    <div ref={mountRef} className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${className}`} aria-hidden>
      <span className="hero-grain" />
    </div>
  );
}
