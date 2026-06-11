"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollSmoother, prefersReducedMotion } from "@/lib/gsap";
import { site, socials } from "@/data/site";

function useBangkokTime() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const magnetRef = useRef<HTMLAnchorElement>(null);
  const time = useBangkokTime();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".footer-line", {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(".footer-fade", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 65%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // magnetic CTA (desktop only)
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const el = magnetRef.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * 0.3);
      yTo((e.clientY - rect.top - rect.height / 2) * 0.3);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const backToTop = () => {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(0, true);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={rootRef} id="contact" className="border-t border-line">
      <div className="px-5 pt-16 md:px-8 md:pt-24">
        <p className="footer-fade font-mono text-[10px] tracking-[0.3em] text-muted uppercase md:text-xs">
          <span className="text-accent">04</span> — Contact
        </p>

        <div className="flex flex-col items-start gap-10 pt-8 pb-16 md:flex-row md:items-end md:justify-between md:pt-12 md:pb-24">
          <h2 className="font-display text-[clamp(3.4rem,11.5vw,11rem)] leading-[0.9] uppercase">
            <span className="block overflow-hidden">
              <span className="footer-line block text-fg">Let&apos;s make</span>
            </span>
            <span className="block overflow-hidden">
              <span className="footer-line text-outline block">
                something<span className="text-accent" style={{ WebkitTextStroke: "0" }}>.</span>
              </span>
            </span>
          </h2>

          <a
            ref={magnetRef}
            href={`mailto:${site.email}`}
            className="footer-fade group flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-fg/30 transition-colors duration-500 hover:border-accent md:h-44 md:w-44"
          >
            <span className="text-center font-mono text-[10px] tracking-[0.25em] text-fg uppercase transition-colors duration-500 group-hover:text-accent md:text-xs">
              Get in
              <br />
              touch ↗
            </span>
          </a>
        </div>

        <div className="grid gap-6 border-t border-line py-10 sm:grid-cols-3">
          {socials.map((social, i) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="footer-fade group flex items-baseline justify-between border-b border-line pb-3 sm:border-b-0 sm:pb-0"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors duration-300 group-hover:text-fg">
                <span className="mr-2 text-[9px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                {social.label}
              </span>
              <span className="font-mono text-xs text-fg/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-accent">
                {social.handle} ↗
              </span>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 font-mono text-[9px] tracking-[0.2em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between md:text-[10px]">
          <span>© 2026 {site.name}</span>
          <span suppressHydrationWarning>
            {site.location} — {time} {site.timezone}
          </span>
          <button onClick={backToTop} className="text-left transition-colors duration-300 hover:text-fg sm:text-right">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
