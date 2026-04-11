"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DemoFullSystemProp = {
  steps: {
    title: string;
    description: string;
    message: string;
    smallWin: string;
  }[];
};

// 🔹 shared animation (avoid repetition)
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export const DemoFullSystem = ({ steps }: DemoFullSystemProp) => {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-24 w-full flex flex-col items-center"
    >
      {/* Heading */}
      <motion.div {...fadeIn} className="text-center mb-16 md:mb-24 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-outfit tracking-tight leading-tight text-balance">
          From first interaction to{" "}
          <span className="text-accent underline decoration-accent/20 decoration-4 md:decoration-8 underline-offset-4">
            5-star review
          </span>
          <br />
          all automated.
        </h2>
      </motion.div>

      {/* Workflow */}
      <div className="relative w-full max-w-5xl">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 h-full w-px md:w-[2px] -translate-x-1/2 border-l-2 md:border-l-4 border-dashed border-accent/30 hidden sm:block" />

        <div className="space-y-12 md:space-y-20">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center md:items-start w-full group"
              >
                {/* Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border-4 md:border-[5px] border-accent shadow-[0_0_15px_rgba(29,158,117,0.35)] z-20 items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-accent">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-accent group-hover:bg-white" />
                </div>

                {/* Horizontal connector */}
                <div
                  className={`hidden md:block absolute top-6 md:top-7 h-px border-t-2 border-dashed border-accent/30 transition-all duration-500 group-hover:border-accent/60
                  ${isLeft ? "right-1/2 w-16 md:w-24" : "left-1/2 w-16 md:w-24"}
                `}
                />

                <div
                  className={`w-full flex ${
                    isLeft ? "md:justify-start" : "md:justify-end"
                  } justify-center`}
                >
                  {/* Card */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                      x: isLeft ? -20 : 20,
                    }}
                    whileInView={{ opacity: 1, y: 0, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="w-full max-w-lg"
                  >
                    <Card className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/70 backdrop-blur-xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:border-accent/60">
                      {/* Header bar */}
                      <div className="bg-accent/5 px-6 md:px-8 py-3 md:py-4 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-[9px] md:text-[10px] font-black tracking-[0.25em] text-accent/60 uppercase">
                            Waypoint
                          </span>

                          <Badge className="bg-accent text-white font-black text-[10px] md:text-xs px-3 md:px-4 py-1 rounded-xl border-none">
                            STOP {index + 1}
                          </Badge>
                        </div>

                        <span className="text-[10px] md:text-[11px] font-extrabold text-accent/80 tracking-widest uppercase bg-accent/10 py-1 px-2 md:px-3 rounded-full">
                          Auto
                        </span>
                      </div>

                      {/* Content */}
                      <CardHeader className="p-6 md:p-8 pb-3 md:pb-4">
                        <h3 className="text-xl md:text-3xl font-outfit font-black leading-tight tracking-tight mb-2 md:mb-3">
                          {step.title}
                        </h3>

                        <CardDescription className="text-sm md:text-lg text-muted-foreground/90 leading-relaxed font-medium">
                          {step.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pb-5 md:pb-6 px-6 md:px-8">
                        <div className="relative bg-background/80 border border-border/50 rounded-xl md:rounded-2xl p-3 md:p-4 transition-colors group-hover:bg-background">
                          <p className="text-sm md:text-base font-medium text-foreground/90 leading-relaxed italic">
                            “{step.message}”
                          </p>

                          {/* Bubble tail */}
                          <div className="absolute -bottom-2 left-5 w-3 h-3 md:w-4 md:h-4 bg-background border-r border-b border-border/50 rotate-45" />
                        </div>
                      </CardContent>

                      <CardFooter className="px-6 md:px-8 pb-6 md:pb-8 flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-accent animate-pulse"
                              style={{ animationDelay: `${i * 200}ms` }}
                            />
                          ))}
                        </div>

                        <p className="text-[10px] md:text-sm font-black text-accent uppercase tracking-wider bg-accent/5 px-2 md:px-3 py-1 rounded-md">
                          {step.smallWin}
                        </p>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
