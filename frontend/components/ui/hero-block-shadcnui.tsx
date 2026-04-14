"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Video, Zap } from "lucide-react";
import { memo, useMemo } from "react";
import Image from "next/image";
import { useDomainNavigation } from "@/hook/useDomainNavigation";
import Link from "next/link";

const badges = ["14 day setup", "No long contracts", "Works with your CRM"];

export const HeroBlock = memo(function HeroBlock() {
  const { goTo } = useDomainNavigation();

  const entranceAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [],
  );

  const staggerAnim = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-background min-h-screen w-full select-none">
      {/* Grid background (static, premium subtlety) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-5 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.08)_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      {/* Ambient glow (static, premium spotlight feel) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-full bg-radial from-primary/5 to-transparent -z-10 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 container-narrow px-6 text-center">
        <motion.div {...entranceAnim}>
          {/* Static Hero Image — No movement */}
          <div className="mt-10 relative inline-block">
            <div className="absolute inset-0 bg-accent/5 blur-2xl rounded-full -z-10 opacity-60" />
            <Image
              src="/characters/auto-friends.png"
              alt="AutomEdge AI Characters"
              width={380}
              height={380}
              priority
              loading="eager"
            />
          </div>

          {/* Headline */}
          <motion.div {...staggerAnim(0.15)} className="mb-6 space-y-2">
            <h1 className="font-outfit font-black bg-linear-to-b from-foreground to-foreground/80 bg-clip-text text-transparent tracking-tight leading-[0.95] text-5xl sm:text-6xl md:text-7xl px-2">
              <span
                className="font-light tracking-tight italic block mb-2 text-2xl md:text-5xl"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
              >
                Stop Losing Jobs to
              </span>
              Slow{" "}
              <span className="text-accent underline decoration-accent/15 underline-offset-12">
                Response.
              </span>
            </h1>
          </motion.div>

          {/* Value Prop */}
          <motion.p
            {...staggerAnim(0.25)}
            className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-muted-foreground/90 font-medium leading-relaxed"
          >
            AutomEdge AI responds to every HVAC lead in under 60 seconds{" "}
            <span className="text-foreground font-extrabold italic border-b-2 border-accent/20">
              24/7/365.
            </span>
          </motion.p>

          {/* Primary Actions */}
          <motion.div
            {...staggerAnim(0.35)}
            className="mb-16 flex flex-wrap justify-center gap-5"
          >
            <Button
              asChild
              size="lg"
              className="h-16 px-12 rounded-2xl bg-accent text-accent-foreground font-black text-xl shadow-2xl shadow-accent/20"
            >
              <Link
                href="/demo-hvac"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("demo-hvac");
                }}
              >
                <Zap className="w-6 h-6" />
                Live Demo
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => goTo("contact")}
              className="h-16 px-12 rounded-2xl text-primary hover:text-accent font-bold text-xl active:scale-95"
            >
              <Video className="w-6 h-6" />
              Watch Video
            </Button>
          </motion.div>

          {/* Badges */}
          <motion.div
            {...staggerAnim(0.45)}
            className="flex flex-wrap justify-center gap-4 md:gap-8"
          >
            {badges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2.5 text-muted-foreground/80 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] px-5 py-2.5 rounded-full bg-white/3 border border-white/5 backdrop-blur-md"
              >
                <Check className="w-4 h-4 text-accent stroke-[3px]" />
                {badge}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});
