"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, PhoneCall, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { add } from "firebase/firestore/pipelines";
import useTypewriter from "@/hooks/useTypewriter";

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

const VERTICALS = [
  {
    label: "HVAC",
    photo:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=640&q=70&auto=format",
  },
  {
    label: "Roofing",
    photo:
      "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=640&q=70&auto=format",
  },
  {
    label: "Plumbing",
    photo:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=640&q=70&auto=format",
  },
];

const STATS = [
  { value: "<60s", label: "First response", icon: Clock },
  { value: "3.4×", label: "More booked jobs", icon: TrendingUp },
  { value: "94%", label: "Lead qualification", icon: CheckCircle2 },
];

/* -------------------------------------------------------------------------- */
/* HERO                                                                       */
/* -------------------------------------------------------------------------- */

export function ModernHero() {
  const [active, setActive] = useState(0);
  const typedVertical = useTypewriter(VERTICALS.map((v) => v.label));

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % VERTICALS.length);
    }, 4000);

    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex py-28 px-2 items-center justify-center overflow-hidden bg-background overflow-hidden text-foreground">
      {/* Ambient gradient */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#00C2A8]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT ----------------------------------------------------- */}

        <div className="flex flex-col gap-8">
          <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#00C2A8]">
            AI Lead Automation
          </p>

          <h1 className="text-[3rem] sm:text-[3.4rem] lg:text-[4.8rem] font-black leading-[0.9]">
            Never Miss
            <br />
            Another
            <br />
            <span className="text-[#00C2A8] min-w-[120px] inline-block">
              {typedVertical}
              <span className="animate-pulse">|</span>
            </span>
            Lead
          </h1>

          <p className="text-[#94A3B8] text-lg max-w-md">
            Automedge captures every inbound inquiry, qualifies the lead, books
            the appointment and updates your CRM in seconds.
          </p>

          {/* CTA */}
          <div className="flex gap-4 flex-wrap">
            <Link href="/hvac">
              <button className="flex items-center gap-2 bg-[#00C2A8] text-[#0D1B2A] px-7 py-4 rounded-xl font-bold hover:scale-[1.03] transition">
                <Zap className="w-4 h-4" />
                See Live Demo
              </button>
            </Link>

            <Link href="#contact">
              <button className="flex items-center gap-2 px-7 py-4 rounded-xl border border-[#00C2A8]">
                <PhoneCall className="w-4 h-4 text-[#00C2A8]" />
                Book a Call
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
              >
                <stat.icon className="w-4 h-4 text-[#00C2A8] mb-2" />
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-xs text-foreground/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT ---------------------------------------------------- */}

        <div className="relative">
          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={VERTICALS[active].photo}
              alt={VERTICALS[active].label}
              className="w-full h-[420px] object-cover"
              loading="eager"
              decoding="async"
            />

            <div className="absolute bottom-5 right-5 bg-background/80 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
              <p className="text-xs text-foreground/50">Industry</p>
              <p className="text-lg font-bold">{VERTICALS[active].label}</p>
            </div>
          </div>
          {/* floating card */}{" "}
          <div className="absolute -bottom-8 -left-6 bg-background/80 backdrop-blur-xl border border-border rounded-xl px-5 py-3 shadow-xl">
            <p className="text-xs text-muted-foreground">Avg response</p>
            <p className="text-2xl font-black">
              47 <span className="text-sm text-[#00C2A8]">sec</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
