"use client";

import { motion } from "motion/react";
import { ReactNode, useMemo } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 40,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const initialVariants = useMemo(() => {
    const offsets = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
    };
    return {
      opacity: 0,
      ...offsets[direction],
    };
  }, [direction, distance]);

  return (
    <motion.div
      initial={initialVariants}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once, margin: "-15% 0px -15% 0px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1] as const, // Faster, more snappy quintic ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
