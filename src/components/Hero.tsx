"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/data/site";
import HeroCanvas from "./HeroCanvas";
import HeroGradient from "./HeroGradient";

// hero background: "particles" (ember field) or "gradient" (blurred fluid gradient)
const HERO_BG: "particles" | "gradient" = "gradient";

const TITLE = "HOLMES";
const ROLES = ["Developer", "Photographer", "Filmmaker"];

type HeroProps = {
  ready: boolean;
};

export default function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);

  // set hidden states immediately (preloader covers the screen)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-char", { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 24 });
      gsap.set(".hero-canvas", { opacity: 0 });
      gsap.set(".hero-bracket", { opacity: 0, scale: 0.8 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // intro, fired by preloader handoff
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(".hero-char", { yPercent: 0, duration: 1.2, stagger: 0.06, ease: "expo.out" })
        .to(".hero-canvas", { opacity: 1, duration: 1.8, ease: "power2.inOut" }, 0.3)
        .to(".hero-fade", { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.55)
        .to(".hero-bracket", { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" }, 0.5);

      // drift the title up as you scroll away
      gsap.to(".hero-inner", {
        yPercent: -18,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  // ensure triggers created before images load measure correctly
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <section ref={rootRef} id="home" className="relative flex h-svh min-h-[560px] flex-col overflow-hidden">
      {HERO_BG === "gradient" ? <HeroGradient className="hero-canvas" /> : <HeroCanvas className="hero-canvas" />}

      {/* vignette + bottom fade for readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 35%, rgba(10,10,9,0.8) 100%), linear-gradient(to bottom, transparent 75%, var(--bg) 100%)",
        }}
        aria-hidden
      />

      {/* viewfinder corner brackets */}
      <div className="pointer-events-none absolute inset-4 md:inset-7" aria-hidden>
        <span className="hero-bracket absolute top-12 left-0 h-5 w-5 border-t border-l border-fg/30 md:top-14" />
        <span className="hero-bracket absolute top-12 right-0 h-5 w-5 border-t border-r border-fg/30 md:top-14" />
        <span className="hero-bracket absolute bottom-0 left-0 h-5 w-5 border-b border-l border-fg/30" />
        <span className="hero-bracket absolute right-0 bottom-0 h-5 w-5 border-r border-b border-fg/30" />
      </div>

      <div className="hero-inner relative z-10 flex flex-1 flex-col items-center justify-center px-5">
        <p className="hero-fade mb-3 font-mono text-[10px] tracking-[0.35em] text-fg/80 uppercase md:mb-5 md:text-xs">
          {site.name}
        </p>

        <h1 aria-label={TITLE} className="flex w-full max-w-[1600px] justify-between px-1 sm:px-4">
          {TITLE.split("").map((char, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]" aria-hidden>
              <span className="hero-char inline-block font-display text-[clamp(4.2rem,21vw,19rem)] leading-[0.9] text-fg">
                {char}
              </span>
            </span>
          ))}
        </h1>

        <div className="hero-fade mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.3em] text-fg/80 uppercase md:mt-7 md:text-xs">
          {ROLES.map((role, i) => (
            <span key={role} className="flex items-center gap-3">
              {i > 0 && <span className="text-accent">✕</span>}
              <span>{role}</span>
            </span>
          ))}
        </div>
      </div>

      {/* bottom HUD */}
      <div className="relative z-10 grid grid-cols-2 items-end gap-4 px-10 pb-10 font-mono text-[9px] tracking-[0.25em] text-muted uppercase select-none md:grid-cols-3 md:px-14 md:pb-12 md:text-[10px]">
        <div className="hero-fade flex items-center gap-2.5">
          <span className="rec-dot" />
          <span>
            Rec — Portfolio <span className="hidden sm:inline">/ ©2026</span>
          </span>
        </div>
        <div className="hero-fade hidden flex-col items-center gap-2 md:flex">
          <span>Scroll</span>
          <span className="scroll-cue" />
        </div>
        <div className="hero-fade text-right">
          <span className="hidden sm:inline">ISO 400 — f/1.8 — </span>
          {site.location} 🇹🇭 {site.timezone}
        </div>
      </div>
    </section>
  );
}
