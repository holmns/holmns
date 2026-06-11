"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
};

export default function SectionHeading({ index, label, title }: SectionHeadingProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".sh-meta", {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
      });
      gsap.from(".sh-title", {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
      });
      gsap.from(".sh-rule", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="px-5 md:px-8">
      <div className="sh-rule h-px w-full bg-line" />
      <div className="sh-meta flex items-baseline justify-between pt-4 font-mono text-[10px] tracking-[0.3em] text-muted uppercase md:text-xs">
        <span>
          <span className="text-accent">{index}</span> — {label}
        </span>
        <span className="hidden sm:inline">/{label.toLowerCase().replace(/\s/g, "-")}</span>
      </div>
      <h2 className="overflow-hidden pt-6 pb-2 md:pt-10">
        <span className="sh-title block font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] text-fg uppercase">
          {title}
        </span>
      </h2>
    </div>
  );
}
