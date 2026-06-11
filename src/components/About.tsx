"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

const META = [
  { label: "Based in", value: "Thailand — GMT+7" },
  { label: "Focus", value: "Apps · Applied AI · Film" },
  { label: "Status", value: "Open to collaborations" },
];

const CORNERS = [
  "-top-1.5 -left-1.5 border-t border-l",
  "-top-1.5 -right-1.5 border-t border-r",
  "-bottom-1.5 -left-1.5 border-b border-l",
  "-bottom-1.5 -right-1.5 border-b border-r",
];

export default function About() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      let split: SplitText | undefined;
      // wait for fonts so line breaks are measured correctly
      document.fonts.ready.then(() => {
        if (!rootRef.current) return;
        split = SplitText.create(".about-statement", { type: "lines", mask: "lines" });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: ".about-statement", start: "top 80%" },
        });
      });

      // portrait develops like a print
      gsap.fromTo(
        ".about-frame",
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger: { trigger: ".about-photo", start: "top 78%" },
        }
      );
      gsap.fromTo(
        ".about-img",
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      // focus pull tied to scroll position: soft entering, sharp at viewport center, soft leaving
      const img = rootRef.current!.querySelector<HTMLElement>(".about-img");
      const applyFocus = (progress: number) => {
        if (!img) return;
        const offCenter = Math.abs(progress - 0.5) * 2;
        const blur = Math.pow(offCenter, 1.6) * 7;
        img.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      };
      const focusTrigger = ScrollTrigger.create({
        trigger: ".about-photo",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => applyFocus(self.progress),
      });
      applyFocus(focusTrigger.progress);
      gsap.from([".about-corner", ".about-caption"], {
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-photo", start: "top 70%" },
      });

      gsap.from(".about-sub", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-sub", start: "top 88%" },
      });

      gsap.from(".about-meta-item", {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-meta", start: "top 88%" },
      });

      return () => split?.revert();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" className="pt-24 pb-28 md:pt-36 md:pb-40">
      <SectionHeading index="01" label="About" title="The person behind the lens" />

      <div className="grid gap-12 px-5 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pt-16">
        <figure className="about-photo group relative md:col-span-4" data-hover>
          <div className="about-frame relative aspect-[4/5] overflow-hidden border border-line">
            <Image
              src="/me.jpg"
              alt="Nawat 'Holmes' Suangburanakul — self portrait in red light"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="about-img scale-[1.25] object-cover"
            />
          </div>
          {CORNERS.map((corner) => (
            <span
              key={corner}
              className={`about-corner absolute h-4 w-4 border-fg/40 transition-colors duration-500 group-hover:border-accent ${corner}`}
              aria-hidden
            />
          ))}
          <figcaption className="about-caption flex items-center justify-between pt-4 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            <span>
              <span className="text-accent">●</span> Self portrait
            </span>
            <span>Fig. 01</span>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-10 md:col-span-7 md:col-start-6">
          <p className="about-statement text-fg/90 text-[clamp(1.35rem,2.7vw,2.35rem)] leading-[1.35] font-light tracking-tight">
            I&apos;m Holmes — I build software and frame the world through a lens. One day that means shipping an iOS
            app or training a model that listens for failing hearts; the next it&apos;s grading a film or chasing light
            down a side street. Code, stills, motion — different tools, same obsession: making things people feel.
          </p>

          <p className="about-sub max-w-md text-sm leading-relaxed text-muted md:text-base">
            Most days I&apos;m somewhere between a code editor and a viewfinder — building, shooting, cutting, then
            starting again.
          </p>

          <div className="about-meta grid gap-6 sm:grid-cols-3 md:mt-auto">
            {META.map((item) => (
              <div key={item.label} className="about-meta-item border-t border-line pt-3">
                <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">{item.label}</p>
                <p className="pt-1.5 text-sm text-fg md:text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
