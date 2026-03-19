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
    color: "from-blue-500 to-cyan-400",
    href: "/demo-hvac",
  },
  {
    id: "plumbing",
    title: "Plumbing",
    description: "Instant dispatching for emergency leaks.",
    icon: Droplet,
    color: "from-cyan-500 to-sky-400",
    href: "/demo-plumbing",
  },
  {
    id: "pest",
    title: "Pest Control",
    description: "Convert seasonal inquiries into bookings.",
    icon: Bug,
    color: "from-emerald-500 to-green-400",
    href: "/demo-pest-control",
  },
  {
    id: "roofing",
    title: "Roofing",
    description: "Qualify storm damage leads instantly.",
    icon: Home,
    color: "from-amber-500 to-orange-400",
    href: "/demo-roofing",
  },
];

// ─── Premium Card ─────────────────────────
const DemoCard = memo(({ demo }: any) => {
  const Icon = demo.icon;

  return (
    <Link href={demo.href} className="group block relative h-full">
      <motion.div
        whileHover={{ y: -6, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-full"
      >
        {/* Neon Ambient Glow */}
        <div
          className={`absolute -inset-4 rounded-4xl bg-linear-to-br ${demo.color} opacity-0 group-hover:opacity-15 blur-3xl transition-opacity duration-500`}
        />

        <div className="relative h-full rounded-4xl border-2 border-border/50 bg-card/40 backdrop-blur-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center hover:border-accent/40 transition-colors shadow-sm group-hover:shadow-2xl overflow-hidden">
          {/* Subtle Shimmer Background */}
          <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

          {/* Icon container */}
          <div className="relative mb-8">
            <div
              className={`w-20 h-20 rounded-2xl bg-linear-to-br ${demo.color} shadow-[0_10px_30px_-5px_var(--tw-shadow-color)] shadow-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
            {/* Pulsing ring around icon */}
            <div
              className={`absolute -inset-2 rounded-2xl border-2 border-accent/20 animate-ping [animation-duration:3s] opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </div>

          {/* Title */}
          <h4 className="text-3xl md:text-4xl font-outfit font-black text-foreground mb-4 tracking-tighter leading-none">
            {demo.title}
          </h4>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed max-w-[400px] font-medium mb-8">
            {demo.description}
          </p>

          {/* Bottom Action */}
          <div className="mt-auto flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            See Live Demo
            <ChevronDown className="w-4 h-4 -rotate-90" />
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
    <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden relative">
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
          {DEMOS.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      </div>
    </section>
  );
}
