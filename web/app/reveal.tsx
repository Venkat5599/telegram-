"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const; // expo-out, heavy & cinematic

// Fade-up + blur dissolve. `immediate` = animate on mount (use above the fold);
// otherwise animate when scrolled into view.
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  immediate?: boolean;
}) {
  const anim = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      {...(immediate
        ? { animate: anim }
        : { whileInView: anim, viewport: { once: true, margin: "-12% 0px" } })}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Per-word staggered reveal for giant editorial headings.
export function RevealWords({
  text,
  className,
  delay = 0,
  immediate = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => {
        const anim = { y: "0%" };
        return (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              {...(immediate
                ? { animate: anim }
                : { whileInView: anim, viewport: { once: true } })}
              transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
