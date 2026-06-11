"use client";

import { useEffect, useRef } from "react";
import { gsap, isTouchDevice, prefersReducedMotion } from "@/lib/gsap";

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
];

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const dot = dotRef.current!;
    const frame = frameRef.current!;
    const inner = innerRef.current!;

    gsap.set([dot, frame], { opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    const frameX = gsap.quickTo(frame, "x", { duration: 0.4, ease: "power3.out" });
    const frameY = gsap.quickTo(frame, "y", { duration: 0.4, ease: "power3.out" });
    // quickTo can't retarget "scale" (it splits into scaleX/scaleY internally), so use a plain tween
    const frameScale = (value: number) =>
      gsap.to(inner, { scale: value, duration: 0.4, ease: "back.out(1.8)", overwrite: "auto" });

    let visible = false;
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set([dot, frame], { x: e.clientX, y: e.clientY });
        gsap.to(dot, { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      frameX(e.clientX);
      frameY(e.clientY);

      const target = (e.target as Element | null)?.closest?.("a, button, [data-hover]");
      if (!!target !== hovering) {
        hovering = !!target;
        gsap.to(frame, { opacity: hovering ? 1 : 0, duration: 0.3, overwrite: "auto" });
        frameScale(hovering ? 1.7 : 1);
      }
    };

    // autofocus: blur the bracket while it travels, pull focus when it rests
    const last = { x: 0, y: 0 };
    let blur = 0;
    const tick = () => {
      const x = Number(gsap.getProperty(frame, "x"));
      const y = Number(gsap.getProperty(frame, "y"));
      const speed = Math.hypot(x - last.x, y - last.y);
      last.x = x;
      last.y = y;
      const target = Math.min(speed * 0.14, 3.5);
      blur += (target - blur) * (target > blur ? 0.35 : 0.1);
      inner.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
    };
    gsap.ticker.add(tick);

    const onLeave = () => {
      visible = false;
      hovering = false;
      gsap.to([dot, frame], { opacity: 0, duration: 0.3, overwrite: "auto" });
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={frameRef} className="cursor-frame" aria-hidden>
        <div ref={innerRef} className="cursor-frame-inner">
          {CORNERS.map((corner) => (
            <span key={corner} className={`absolute h-2.5 w-2.5 border-fg ${corner}`} />
          ))}
        </div>
      </div>
    </>
  );
}
