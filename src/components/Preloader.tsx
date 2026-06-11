"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/data/site";

type PreloaderProps = {
  onComplete: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    const root = rootRef.current!;

    if (prefersReducedMotion()) {
      root.style.display = "none";
      doneRef.current();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const progress = { value: 0 };
      const tl = gsap.timeline();

      tl.from(".pre-meta", { yPercent: 120, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" })
        .to(
          progress,
          {
            value: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counterRef.current) counterRef.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
            },
          },
          0.1
        )
        .add(() => {
          document.documentElement.style.overflow = "";
          doneRef.current();
        })
        .to(root, {
          yPercent: -100,
          duration: 0.9,
          ease: "expo.inOut",
          onComplete: () => {
            root.style.display = "none";
          },
        });
    }, root);

    return () => {
      document.documentElement.style.overflow = "";
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 z-90 flex flex-col justify-between bg-bg p-5 md:p-8" aria-hidden>
      <div className="flex items-start justify-between overflow-hidden font-mono text-[10px] tracking-[0.25em] text-muted uppercase md:text-xs">
        <span className="pre-meta">{site.name}</span>
        <span className="pre-meta hidden sm:block">Portfolio — ©2026</span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="overflow-hidden">
          <p className="pre-meta font-mono text-[10px] tracking-[0.25em] text-muted uppercase md:text-xs">
            <span className="text-accent">●</span> Loading experience
          </p>
        </div>
        <span
          ref={counterRef}
          className="font-display text-[clamp(5rem,18vw,12rem)] leading-[0.85] text-fg tabular-nums"
        >
          000
        </span>
      </div>
    </div>
  );
}
