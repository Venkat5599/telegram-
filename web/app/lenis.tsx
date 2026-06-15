"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Buttery smooth scroll — the foundation of the Awwwards feel.
export default function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
