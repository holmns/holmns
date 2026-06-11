"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { projects, Project } from "@/data/site";
import { techMap } from "@/data/techMap";
import SectionHeading from "./SectionHeading";

const STATUS_STYLE: Record<Project["status"], string> = {
  live: "text-accent border-accent/50",
  "in development": "text-muted border-line",
  research: "text-muted border-line",
};

function WorkCard({ project, flip }: { project: Project; flip: boolean }) {
  const media = (
    <div
      className="work-media group relative aspect-[16/10] overflow-hidden border border-line bg-fg/5"
      data-hover
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="work-img scale-[1.15] object-cover transition-[filter] duration-700 group-hover:grayscale-0 md:grayscale-[0.4]"
      />
      <div className="absolute inset-0 bg-bg/20 transition-opacity duration-500 group-hover:opacity-0" aria-hidden />
      {project.link && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-400 group-hover:opacity-100">
          <span className="rounded-full bg-bg/80 px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-fg uppercase backdrop-blur-sm">
            Open ↗
          </span>
        </span>
      )}
    </div>
  );

  return (
    <article className="work-card grid items-center gap-6 md:grid-cols-12 md:gap-10">
      <div className={`md:col-span-7 ${flip ? "md:order-2" : ""}`}>
        {project.link ? (
          <a href={project.link} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
            {media}
          </a>
        ) : (
          media
        )}
      </div>

      <div className={`flex flex-col gap-4 md:col-span-5 ${flip ? "md:order-1" : ""}`}>
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
          <span>
            <span className="text-accent">{project.index}</span> — {project.tagline}
          </span>
        </div>

        <h3 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.92] text-fg uppercase">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 hover:text-accent"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>

        <p className="max-w-md text-sm leading-relaxed text-muted md:text-base">{project.desc}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className={`rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.2em] uppercase ${STATUS_STYLE[project.status]}`}
          >
            {project.status === "live" && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />}
            {project.status}
          </span>
          {project.tech.map((id) => (
            <span
              key={id}
              className="rounded-full border border-line px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-fg/70 uppercase"
            >
              {techMap[id].name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Works() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 80,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" },
        });

        const img = card.querySelector(".work-img");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        }
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="work" className="pb-28 md:pb-40">
      <SectionHeading index="03" label="Work" title="Selected work" />
      <div className="flex flex-col gap-20 px-5 pt-12 md:gap-32 md:px-8 md:pt-20">
        {projects.map((project, i) => (
          <WorkCard key={project.title} project={project} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
