"use client";

import { Check, Flame } from "lucide-react";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { Badge } from "@/components/ui/badge";
import { ComicText } from "@/components/ui/comic-text";

type DemoPageHeroProp = {
  title?: string;
  highlight?: string;
  subTitle?: string;
  description?: string;
  tags?: string[];
};

export function DemoPageHero({
  title,
  highlight,
  subTitle,
  description,
  tags,
}: DemoPageHeroProp) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* gradient base */}
        <div className="absolute inset-0 from-accent/20 via-primary/10 to-background dark:from-accent/10 dark:via-primary/20 dark:to-background" />

        {/* floating blobs */}
        <div className="absolute top-[10%] left-[5%] w-125 h-125 bg-accent/30 rounded-full blur-[160px] opacity-40" />
        <div className="absolute bottom-[10%] right-[5%] w-150 h-150 bg-primary/30 rounded-full blur-[180px] opacity-40" />
        <div className="absolute top-[40%] right-[30%] w-100 h-100 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-[160px]" />
      </div>

      <div className="container-page relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          {/* Headline */}
          <h1 className="hero-headline text-foreground">
            {title} <br />
                 {highlight && (
              <div className="my-6 inline-flex justify-center w-full">
                <ComicText fontSize={3.5} className="text-accent">
                  {highlight}
                </ComicText>
              </div>
            )}
            {subTitle}
          </h1>
          {/* Description */}
          <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed md:mt-2">
            {description}
          </p>
          {/* Tags */}
          {tags && (
            <div className="flex flex-wrap items-center justify-center gap-3 md:mt-8">
              {tags.map((tag, idx) => (
                <Badge variant="outline" key={idx} className="flax gap-2">
                  <Check data-icon="inline-start" className="text-accent" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:mt-6">
            <button
              onClick={() =>
                document
                  .getElementById("calendar")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto px-10 py-5 bg-cta glow-cta text-black font-black rounded-2xl hover:-translate-y-1 transition-all active:scale-95 shadow-2xl text-lg"
            >
              Book My Demo
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-background border-2 border-border/50 text-foreground font-bold rounded-2xl hover:bg-muted transition-all text-lg">
              Watch 2-Min Video
            </button>
          </div>

          <Badge className="flex items-center gap-2 px-6 py-3 text-sm md:text-base font-bold mt-8 bg-accent/5 border-accent/20 text-accent rounded-full">
            <Flame className="w-5 h-5 text-accent shrink-0" />
            Every hour without this, a lead goes to whoever responds faster
          </Badge>
        </div>
      </div>
    </section>
  );
}
