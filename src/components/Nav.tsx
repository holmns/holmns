"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollSmoother, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { navLinks, site, socials } from "@/data/site";

type NavProps = {
  ready: boolean;
};

export default function Nav({ ready }: NavProps) {
  const barRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // entrance once the preloader hands off
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const tween = gsap.from(barRef.current, { yPercent: -120, duration: 1, ease: "expo.out", delay: 0.2 });
    return () => {
      tween.kill();
    };
  }, [ready]);

  // hide on scroll down, reveal on scroll up
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = barRef.current!;
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const shouldHide = self.direction === 1 && self.scroll() > 150;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(bar, { yPercent: hidden ? -120 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        }
      },
    });
    return () => st.kill();
  }, []);

  const scrollTo = useCallback((href: string) => {
    setOpen(false);
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(href, true, "top 80px");
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // mobile menu open/close
  useEffect(() => {
    const menu = menuRef.current!;
    const smoother = ScrollSmoother.get();
    if (open) {
      smoother?.paused(true);
      // the close button lives in the bar — make sure it isn't scrolled away
      gsap.to(barRef.current, { yPercent: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      gsap.set(menu, { display: "flex" });
      gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(
        menu.querySelectorAll(".menu-link"),
        { yPercent: 120 },
        { yPercent: 0, duration: 0.7, stagger: 0.07, ease: "expo.out", delay: 0.1 }
      );
    } else {
      smoother?.paused(false);
      gsap.to(menu, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(menu, { display: "none" }),
      });
    }
  }, [open]);

  return (
    <>
      <header
        ref={barRef}
        className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-5 py-4 md:px-8 md:py-5"
      >
        {/* no aria-label here: content-blocker annoyance lists hide elements
            labelled "Back to top"; the visible brand text names the button */}
        <button
          onClick={() => scrollTo("#home")}
          className="font-display text-lg tracking-wide text-fg uppercase md:text-xl"
        >
          {site.brand}
          <span className="text-accent">®</span>
        </button>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="group font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-fg"
            >
              <span className="mr-1 text-[9px] text-accent">{link.index}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="relative z-60 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`block h-px w-6 bg-fg transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-fg transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </header>

      {/* mobile menu overlay */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 hidden flex-col justify-between bg-bg/95 px-5 pt-28 pb-8 backdrop-blur-md md:hidden"
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {navLinks.map((link) => (
            <div key={link.href} className="overflow-hidden border-b border-line py-3">
              <button onClick={() => scrollTo(link.href)} className="menu-link flex w-full items-baseline gap-4 text-left">
                <span className="font-mono text-xs text-accent">{link.index}</span>
                <span className="font-display text-5xl text-fg uppercase">{link.label}</span>
              </button>
            </div>
          ))}
        </nav>
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
          {socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="hover:text-fg">
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
