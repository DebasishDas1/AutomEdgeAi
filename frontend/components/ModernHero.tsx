"use client";

import dynamic from "next/dynamic";
import { Zap, Check, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDomainNavigation } from "@/hook/useDomainNavigation";
import Link from "next/link";

const GLSLHills = dynamic(
  () => import("@/components/ui/glsl-hills").then((mod) => mod.GLSLHills),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-background" />,
  },
);

const badges = ["14 day setup", "No long contracts", "Works with your CRM"];

export const ModernHero = () => {
  const { goTo } = useDomainNavigation();
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-4 md:px-8 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 hidden md:block pointer-events-none">
        <GLSLHills />
      </div>

      {/* Content Container - Use relative to allow natural text flow & avoid cutoff on zoom */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4 md:space-y-6">
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tighter">
            <span className="italic text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light block mb-2 opacity-80 decoration-accent/20 underline underline-offset-12">
              Stop Losing Jobs
            </span>
            to <span className="text-accent">Slow Lead Response</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-2">
            AutomEdge responds to every HVAC lead in under 60 seconds —
            qualifies, books, and follows up automatically. No extra staff.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center justify-center w-full sm:w-auto px-4">
          <Link
            href="/demo-hvac"
            onClick={(e) => {
              e.preventDefault();
              goTo("demo-hvac");
            }}
            aria-label="See HVAC Demo Live"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 lg:px-12 py-4 lg:py-6 rounded-2xl font-black hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all group shadow-xl glow-accent text-lg"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            See it Live - Free Demo
          </Link>

          <button
            onClick={() => goTo("contact")}
            aria-label="Watch Introduction Video"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 lg:px-12 py-4 lg:py-6 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-md hover:bg-muted transition-all font-bold text-lg"
          >
            <Video className="w-5 h-5 text-accent" />
            Watch 3-minute Video
          </button>
        </div>

        <div className="flex gap-3 md:gap-6 flex-wrap items-center justify-center w-full px-4">
          {badges.map((badge) => (
            <Badge
              variant="outline"
              key={badge}
              className="flex items-center gap-2 py-2 px-5 border-accent/20 bg-accent/5 rounded-full text-xs md:text-sm font-bold shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-accent stroke-[3px]" />
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      {/* Decorative Blur Bottom - Fixed height is okay for dekorative but use relative for safety if needed */}
      <div
        className="
          pointer-events-none
          absolute bottom-0 left-0 w-full
          h-24 md:h-40
          bg-linear-to-t
          from-background
          via-background/70
          to-transparent
          backdrop-blur-[1px]
          z-20
        "
      />
    </section>
  );
};
