"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

export const DemoFullSystem = ({ steps }: DemoFullSystemProp) => {
  return (
    <section
      id="demo_full_system"
      className="py-28 px-6 max-w-6xl mx-auto scroll-mt-24"
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-6xl font-outfit tracking-tight leading-tight">
          From first text to
          <span className="text-accent"> 5-star review</span>
          <br />
          all automated.
        </h2>
      </motion.div>

      {/* Workflow container */}
      <div className="relative">
        {/* center line */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />

        <div className="space-y-16">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={index}
                className={`relative flex items-center ${
                  isLeft ? "justify-start" : "justify-end"
                }`}
              >
                {/* node dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-md z-10" />

                {/* card */}
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="w-full max-w-md"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xl">
                          Step {index + 1}
                        </Badge>

                        <h3 className="text-lg font-semibold my-2">
                          {step.title}
                        </h3>
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>

                    {/* message bubble */}

                    <CardContent>
                      <p>{step.message}</p>
                    </CardContent>

                    <CardFooter>
                      <p className="text-sm text-accent">{step.smallWin}</p>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
