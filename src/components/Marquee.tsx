"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const PHRASE = ["Developer", "Photographer", "Filmmaker"];

function Row() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden>
      {Array.from({ length: 3 }).flatMap((_, i) =>
        PHRASE.map((word, j) => (
          <span key={`${i}-${j}`} className="flex items-center">
            <span className="text-outline px-5 font-display text-[clamp(3rem,8vw,7rem)] leading-none uppercase md:px-8">
              {word}
            </span>
            <span className="text-accent text-[clamp(1.2rem,3vw,2.5rem)]">✕</span>
          </span>
        ))
      )}
    </div>
  );
}

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const track = trackRef.current!;

    const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });

    // scrub speed with scroll velocity
    let speed = 1;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        speed = gsap.utils.clamp(-4, 4, 1 + self.getVelocity() / 900);
      },
    });
    const tick = () => {
      speed = gsap.utils.interpolate(speed, 1, 0.05);
      loop.timeScale(speed);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      loop.kill();
    };
  }, []);

  return (
    <section className="overflow-hidden border-y border-line py-6 md:py-8">
      <div ref={trackRef} className="flex w-max will-change-transform">
        <Row />
        <Row />
      </div>
    </section>
  );
}
