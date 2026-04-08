"use client";

import { Zap, Check, Video } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useDomainNavigation } from "@/hook/useDomainNavigation";
import Link from "next/link";

const badges = ["14 day setup", "No long contracts", "Works with your CRM"];

/**
 * ModernHero - High-Performance & Premium Hero.
 *
 * LCP OPTIMIZATIONS:
 * 1. Removed opacity:0 from LCP element to allow instant First Contentful Paint.
 * 2. Added fetchPriority="high" to critical assets.
 * 3. Offloaded infinite loops to CSS keyframes (0 JS main-thread work).
 */
export const ModernHero = () => {
  const { goTo } = useDomainNavigation();

  return (
    <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center pt-28 pb-20 px-6 md:px-12 overflow-hidden bg-background">

      {/* ── AMBIENT AESTHETICS ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-accent/20 blur-[160px] rounded-full animate-aura" />
        <div className="absolute bottom-[-5%] right-[5%] w-[50vw] h-[50vw] bg-primary/10 blur-[130px] rounded-full" />

        {/* Subtle Grid Pattern for 'AI Tech' feel */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(var(--accent) 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── MOBILE HERO ILLUSTRATION (Primary LCP Element) ─────────────────── */}
      {/* LCP FIX: Removed initial opacity:0 to allow immediate painting. 
          Using only translateY for the entrance if desired, or leaving static for immediate LCP. */}
      <div className="block lg:hidden w-full max-w-[280px] mb-10 relative z-10 animate-float opacity-100">
        <Image
          src="/characters/auto-friends.png"
          alt="AutomEdge AI Friends"
          width={400}
          height={400}
          priority
          fetchPriority="high"
          className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        />
      </div>

      {/* ── DESKTOP FLANKING CHARACTERS ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
        {/* Left Flank */}
        <div className="absolute left-[7%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-20">
            <div className="animate-float opacity-100">
              <Image
                src="/characters/auto-wave.png"
                alt="Wave"
                width={220}
                height={220}
              />
            </div>
            <div className="animate-float-tilt opacity-100">
              <Image
                src="/characters/auto-coffee.png"
                alt="Coffee"
                width={140}
                height={140}
              />
            </div>
          </div>
        {/* Right Flank */}
        <div className="absolute right-[7%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-16">
          <div className="animate-float-slow opacity-100">
            <Image
              src="/characters/auto-friends.png"
              alt="Friends"
              width={380}
              height={380}
              className="drop-shadow-2xl"
              fetchPriority="high"
              priority
            />
          </div>
          <div className="animate-float-tilt opacity-100">
            <Image
              src="/characters/auto-research.png"
              alt="Research"
              width={170}
              height={170}
            />
          </div>
        </div>
      </div>

      {/* ── CENTRAL CONTENT CARD (Premium Glassmorphism) ───────────────────── */}
      <div
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-10 p-10 md:p-20 rounded-[56px] 
        bg-white/2 dark:bg-black/40 backdrop-blur-2xl border border-white/10 
        shadow-[0_48px_120px_-32px_rgba(0,0,0,0.5),inset_0_0_2px_rgba(255,255,255,0.05)]
      "
      >
        <div className="space-y-6">
          <Badge
            variant="outline"
            className="py-2.5 px-6 rounded-full border-accent/25 bg-accent/5 text-accent font-black tracking-[0.25em] uppercase text-[10px] md:text-xs"
          >
            AI Lead Engine
          </Badge>

          <h1 className="font-outfit font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
            <span className="italic font-light block mb-3 opacity-60 text-2xl md:text-5xl tracking-tight">
              Stop Losing Jobs
            </span>
            to Slow{" "}
            <span className="text-accent underline decoration-accent/15 underline-offset-12">
              Response.
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed font-medium">
            AutomEdge AI responds to every HVAC lead in under 60 seconds —
            <span className="text-foreground font-bold italic"> 24/7/365.</span>
          </p>
        </div>

        {/* High-Impact Actions */}
        <div className="flex flex-col sm:flex-row gap-5 md:gap-8 w-full sm:w-auto px-4">
          <Link
            href="/demo-hvac"
            onClick={(e) => {
              e.preventDefault();
              goTo("demo-hvac");
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent text-black px-12 py-5 lg:py-6 rounded-2xl font-black 
            shadow-[0_12px_45px_-12px_rgba(29,158,117,0.55)] hover:shadow-[0_20px_60px_-12px_rgba(29,158,117,0.65)]
            hover:-translate-y-1.5 transition-all text-xl"
          >
            <Zap className="w-6 h-6 fill-black" />
            Live Demo
          </Link>

          <button
            onClick={() => goTo("contact")}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 lg:py-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all font-bold text-xl active:scale-95"
          >
            <Video className="w-6 h-6 text-accent" />
            Watch Video
          </button>
        </div>

        {/* Badges Flow */}
        <div className="flex gap-4 md:gap-10 flex-wrap items-center justify-center w-full mt-2">
          {badges.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2.5 text-muted-foreground/80 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-white/3 border border-white/5 backdrop-blur-md"
            >
              <Check className="w-4 h-4 text-accent stroke-[3px]" />
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* ── DECORATIVE TRIM ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-background via-background/40 to-transparent z-20 pointer-events-none" />
    </section>
  );
};
