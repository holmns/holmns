"use client";

import { useState, useEffect } from "react";

export default function NavBar() {
  const [translateY, setTranslateY] = useState(-110);

  useEffect(() => {
    const handleScroll = () => {
      const newTranslateY = Math.min(Math.max(window.scrollY - 660, -110), 0);
      setTranslateY(newTranslateY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full flex flex-row justify-between items-center box-border bg-[rgba(38,38,38,0.5)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-[10px] border border-[rgba(38,38,38,0.85)] py-[15px] px-[30px] z-[10000]"
      style={{
        transition: `transform 0.5s ease`,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <p className="text-light font-medium text-sm md:text-base px-[10px] py-[15px]">
        <span className="block md:hidden">Nawat S.</span>
        <span className="hidden md:block">Nawat Suangburanakul</span>
      </p>
      <ul className="flex flex-row gap-2.5 items-center justify-center">
        <li className="py-[10px] px-[15px] bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl transition-all duration-300">
          <a href="#header" className="text-light text-sm md:text-base">
            Home
          </a>
        </li>
        <li className="py-[10px] px-[15px] bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl transition-all duration-300">
          <a href="#about-me" className="text-light text-sm md:text-base">
            About Me
          </a>
        </li>
        <li className="py-[10px] px-[15px] bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl transition-all duration-300">
          <a href="#my-work" className="text-light text-sm md:text-base">
            My Work
          </a>
        </li>
      </ul>
    </nav>
  );
}
