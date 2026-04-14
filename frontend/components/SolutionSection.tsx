"use client";

import { Sparkles, Zap } from "lucide-react";

type SolutionSectionProps = {
  solutions: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
};

export function SolutionSection({ solutions }: SolutionSectionProps) {
  return (
    <section
      id="solution"
      className="py-20 md:py-28 px-4 md:px-8 bg-muted/30 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
            The Solution
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-outfit font-extrabold leading-[1.05] tracking-tighter mt-6 mb-5">
            Automedge AI: Your 24/7 <br className="hidden md:block" />
            <span className="text-accent underline decoration-accent/20 decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">
              AI Sales System
            </span>
          </h2>

          <p className="text-lg md:text-2xl lg:text-3xl text-muted-foreground font-bold tracking-tight max-w-3xl mx-auto">
            Your Complete AI Sales Engine — Built For You
          </p>
        </div>

        {/* Background accents (lighter impact) */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 opacity-[0.06] pointer-events-none">
            <Sparkles className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48" />
            <Zap className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 rotate-45" />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {solutions.map((item, index) => (
              <div
                key={index}
                className="relative group p-6 md:p-10 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl hover:border-accent/40 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col items-center text-center"
              >
                {/* Icon */}
                <div className="mb-6 md:mb-8 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-inner [&_svg]:w-8 [&_svg]:h-8 md:[&_svg]:w-10 md:[&_svg]:h-10">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-outfit font-black leading-tight tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
