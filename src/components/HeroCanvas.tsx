"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion, isTouchDevice } from "@/lib/gsap";
import { supportsWebGL } from "@/lib/webgl";

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  attribute float aScale;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;
  varying float vHeight;
  varying float vGlow;

  // Simplex 3D noise (Ashima Arts / Stefan Gustavson, MIT)
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 p = position;
    float t = uTime * 0.16;

    // layered rolling waves
    float wave = snoise(vec3(p.x * 0.16, p.z * 0.16, t)) * 1.15
               + snoise(vec3(p.x * 0.45 + 13.7, p.z * 0.45, t * 1.7)) * 0.28;
    p.y += wave;

    // cursor force field: particles part around the pointer and crest upward
    vec2 d = p.xz - uMouse.xz;
    float dist = length(d);
    float influence = smoothstep(3.4, 0.0, dist) * uMouseStrength;
    p.xz += (d / max(dist, 0.001)) * influence * 0.55;
    p.y += influence * (0.9 + 0.35 * sin(uTime * 2.0 + aSeed * 40.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (1.0 + influence * 1.3) / -mv.z;

    float far = smoothstep(-17.0, -7.0, mv.z);
    float near = 1.0 - smoothstep(-3.0, -1.0, mv.z);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 60.0);
    vAlpha = far * near * twinkle;
    vSeed = aSeed;
    vHeight = smoothstep(-1.1, 1.3, wave);
    vGlow = influence;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorEmber;
  uniform vec3 uColorBlood;
  uniform vec3 uColorAccent;
  uniform vec3 uColorCore;
  varying float vAlpha;
  varying float vSeed;
  varying float vHeight;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.08, d);

    // red–black gradient: troughs sink toward ember black, crests burn REC red
    vec3 col = mix(uColorEmber, uColorBlood, vHeight);
    col = mix(col, uColorAccent, pow(vHeight, 3.0) * 0.85);
    // scattered sparks stay hot regardless of height
    col = mix(col, uColorAccent, step(0.93, vSeed) * 0.8);
    // cursor heat: particles ignite toward the hot core near the pointer
    col = mix(col, uColorCore, vGlow * 0.9);

    gl_FragColor = vec4(col, disc * vAlpha * (0.8 + vGlow * 1.2));
  }
`;

export default function HeroCanvas({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 3200 : 7500;

    // no WebGL (e.g. Opera GX with GPU acceleration off): static CSS gradient instead
    let renderer: THREE.WebGLRenderer | null = null;
    if (supportsWebGL()) {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        renderer = null;
      }
    }
    if (!renderer) {
      mount.classList.add("hero-fallback");
      return () => mount.classList.remove("hero-fallback");
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 40);
    camera.position.set(0, 1.7, 5.5);
    camera.lookAt(0, 0.3, -2);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 2] = -8 + Math.random() * 11;
      scales[i] = 0.4 + Math.random() * 1.3;
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 26 * renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector3(0, 0, -2.5) },
        uMouseStrength: { value: 0 },
        uColorEmber: { value: new THREE.Color(0.07, 0.012, 0.006) },
        uColorBlood: { value: new THREE.Color(0.52, 0.06, 0.03) },
        uColorAccent: { value: new THREE.Color(1.0, 0.26, 0.15) },
        uColorCore: { value: new THREE.Color(1.0, 0.42, 0.2) },
      },
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // pointer → world: raycast the cursor onto the particle plane (y = 0)
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const mouseTarget = new THREE.Vector3(0, 0, -2.5);
    const mouseWorld = new THREE.Vector3(0, 0, -2.5);
    // touch devices get an autonomous drift instead of a tracked pointer
    let pointerActive = false;
    const touch = isTouchDevice();
    let strength = 0;

    // mouse parallax (lerped)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!touch) {
        ndc.set(mouse.tx, -mouse.ty);
        pointerActive = true;
      }
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    let raf = 0;
    let running = true;
    let elapsed = 0;
    let last = performance.now();

    const render = () => {
      const now = performance.now();
      elapsed += Math.min(now - last, 100) / 1000; // clamp away pause-induced jumps
      last = now;
      const t = elapsed;
      material.uniforms.uTime.value = t;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      camera.position.x = mouse.x * 0.6;
      camera.position.y = 1.7 - mouse.y * 0.25 + Math.sin(t * 0.3) * 0.05;
      camera.lookAt(0, 0.3, -2);

      if (pointerActive) {
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          mouseTarget.set(THREE.MathUtils.clamp(hit.x, -12, 12), 0, THREE.MathUtils.clamp(hit.z, -9, 4));
        }
      } else {
        // idle drift keeps the field alive without a pointer
        mouseTarget.set(Math.sin(t * 0.28) * 4.5, 0, -2.5 + Math.cos(t * 0.21) * 2.6);
      }
      mouseWorld.lerp(mouseTarget, 0.06);
      strength += ((pointerActive ? 1 : 0.55) - strength) * 0.04;
      material.uniforms.uMouse.value.copy(mouseWorld);
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
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      material.uniforms.uSize.value = 26 * renderer.getPixelRatio();
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
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}
