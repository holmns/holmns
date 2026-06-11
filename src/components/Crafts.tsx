"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { crafts } from "@/data/site";
import { techMap } from "@/data/techMap";
import SectionHeading from "./SectionHeading";

export default function Crafts() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".craft-row").forEach((row) => {
        gsap.from(row.querySelectorAll(".craft-reveal"), {
          opacity: 0,
          y: 50,
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 82%" },
        });
        gsap.from(row, {
          "--rule-scale": 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: row, start: "top 85%" },
        } as gsap.TweenVars);
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="craft" className="pb-28 md:pb-40">
      <SectionHeading index="02" label="Craft" title="Three disciplines" />

      <div className="px-5 pt-10 md:px-8 md:pt-16">
        {crafts.map((craft) => (
          <article
            key={craft.title}
            className="craft-row group relative grid gap-5 py-10 [--rule-scale:1] md:grid-cols-12 md:gap-8 md:py-14"
          >
            <span
              className="absolute top-0 left-0 h-px w-full origin-left bg-line"
              style={{ transform: "scaleX(var(--rule-scale))" }}
              aria-hidden
            />
            <span className="craft-reveal font-mono text-xs text-accent md:col-span-1">({craft.index})</span>

            <h3 className="craft-reveal md:col-span-5">
              <span className="inline-block font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] text-fg uppercase transition-transform duration-500 ease-out group-hover:translate-x-3">
                {craft.title}
              </span>
            </h3>

            <div className="flex flex-col gap-6 md:col-span-6">
              <p className="craft-reveal max-w-md text-sm leading-relaxed text-muted md:text-base">{craft.blurb}</p>
              <ul className="craft-reveal flex flex-wrap gap-2">
                {craft.tech.map((id) => (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors duration-300 hover:border-fg/40"
                  >
                    <Image
                      src={techMap[id].path}
                      alt=""
                      width={28}
                      height={28}
                      className="h-3.5 w-3.5 object-contain"
                    />
                    <span className="font-mono text-[10px] tracking-[0.15em] text-fg/80 uppercase">
                      {techMap[id].name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        <div className="h-px w-full bg-line" aria-hidden />
      </div>
    </section>
  );
}
