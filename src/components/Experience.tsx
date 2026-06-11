"use client";

import { useCallback, useState } from "react";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import Nav from "./Nav";
import SmoothScroll from "./SmoothScroll";
import Hero from "./Hero";
import Marquee from "./Marquee";
import About from "./About";
import Crafts from "./Crafts";
import Works from "./Works";
import Footer from "./Footer";

export default function Experience() {
  const [ready, setReady] = useState(false);
  const handleComplete = useCallback(() => setReady(true), []);

  return (
    <>
      <Preloader onComplete={handleComplete} />
      <Cursor />
      <Nav ready={ready} />
      <SmoothScroll>
        <main>
          <Hero ready={ready} />
          <Marquee />
          <About />
          <Crafts />
          <Works />
        </main>
        <Footer />
      </SmoothScroll>
      <div className="grain" aria-hidden />
    </>
  );
}
