"use client";

import { motion } from "framer-motion";
import {
  Wind,
  Droplet,
  Bug,
  Home,
  Zap,
  ChevronDown,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import { memo } from "react";

// ─── Config ─────────────────────────
const DEMOS = [
  {
    id: "hvac",
    title: "HVAC",
    description: "Book 30% more furnace repairs automatically.",
    icon: Wind,
    href: "/demo-hvac",
  },
  {
    id: "plumbing",
    title: "Plumbing",
    description: "Instant dispatching for emergency leaks.",
    icon: Droplet,
    href: "/demo-plumbing",
  },
  {
    id: "pest",
    title: "Pest Control",
    description: "Convert seasonal inquiries into bookings.",
    icon: Bug,
    href: "/demo-pest-control",
  },
  {
    id: "roofing",
    title: "Roofing",
    description: "Qualify storm damage leads instantly.",
    icon: Home,
    href: "/demo-roofing",
  },
];

// ─── Premium Card ─────────────────────────
const DemoCard = memo(({ index, demo }: any) => {
  const { title, description, href } = demo;
  const Icon = demo.icon;

  return (
    <Link href={href} className="group block relative h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="relative h-full"
      >
        {/* Ambient Golden Glow (Hover Only) */}
        <div className="absolute -inset-2 bg-linear-to-br from-amber-500/20 to-yellow-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        <div className="relative h-full p-10 rounded-[2.5rem] border-2 border-border/50 bg-card/60 backdrop-blur-3xl hover:border-amber-500/40 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col items-center text-center overflow-hidden">
          {/* Internal Shimmer/Light Beam */}
          <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon Container with Golden Treatment */}
          <div className="mb-10 relative">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-inner group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Icon className="w-12 h-12" />
            </div>
            {/* Subtle puls ring around icon */}
            <div className="absolute -inset-2 rounded-2xl border border-amber-500/20 animate-ping [animation-duration:3s] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="text-4xl font-outfit font-black leading-tight tracking-tighter text-amber-500 dark:text-amber-400">
              {title}
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed font-semibold opacity-70 group-hover:opacity-100 transition-opacity max-w-[280px]">
              {description}
            </p>
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-8 flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            Open Workflow Demo
            <Zap className="w-3 h-3 fill-current" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

// ─── Node (minimal) ─────────────────────────
const Node = memo(({ children, label, glow }: any) => (
  <div className="flex flex-col items-center gap-4 text-center group relative">
    <div
      className={`relative ${glow ? "shadow-[0_0_30px_rgba(29,158,117,0.4)]" : ""} transition-all duration-500`}
    >
      {children}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors">
      {label}
    </span>
  </div>
));

// ─── Main Section ─────────────────────────
export function DemoWorkflowSection() {
  return (
    <section
      id="the-engine"
      className="py-32 px-6 max-w-7xl mx-auto overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent -z-10" />

      {/* Header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-accent font-black text-xs uppercase tracking-widest mb-6">
          <Zap className="w-3.5 h-3.5" />
          The Engine
        </div>
        <h2 className="text-5xl md:text-7xl font-outfit font-black mb-6 tracking-tighter leading-none">
          See the AI in{" "}
          <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">
            Action
          </span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Watch how our platform automatically captures, qualifies,{" "}
          <br className="hidden md:block" />
          and books leads in under 60 seconds.
        </p>
      </div>

      {/* Layout */}
      <div className="flex flex-col items-center gap-8 relative">
        {/* Connection Line */}
        <div className="absolute top-10 bottom-40 w-px bg-linear-to-b from-accent/20 via-accent/40 to-transparent -z-10" />

        {/* Trigger */}
        <Node label="New Inquiry">
          <div className="w-16 h-16 rounded-[1.25rem] border-2 border-border/50 bg-background shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-help">
            <Webhook className="w-7 h-7 text-muted-foreground/60" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full" />
          </div>
        </Node>

        <div className="p-2 bg-background rounded-full border-2 border-border/50 shadow-sm">
          <ChevronDown className="w-5 h-5 text-accent animate-bounce" />
        </div>

        {/* AI */}
        <Node label="AI Agent">
          <div className="w-24 h-24 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Zap className="w-10 h-10 text-accent" />
          </div>
        </Node>

        <div className="p-2 bg-background rounded-full border-2 border-border/50 shadow-sm mb-4">
          <ChevronDown className="w-5 h-5 text-accent animate-bounce [animation-delay:200ms]" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-5xl">
          {DEMOS.map((demo, index) => (
            <DemoCard key={demo.id} demo={demo} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
