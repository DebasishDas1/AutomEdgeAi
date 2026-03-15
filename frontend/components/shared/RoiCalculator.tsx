"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Target,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

type RoiCalculatorProps = {
  currencySymbol?: string;
  defaultLeads?: number;
  minLeads?: number;
  maxLeads?: number;
  leadsStep?: number;
  defaultTicketValue?: number;
  minTicketValue?: number;
  maxTicketValue?: number;
  ticketStep?: number;
  defaultCloseRate?: number;
  minCloseRate?: number;
  maxCloseRate?: number;
  closeRateStep?: number;
  customSubResult?: string;
};

export const RoiCalculator = ({
  currencySymbol = "$",
  defaultLeads = 40,
  minLeads = 10,
  maxLeads = 200,
  leadsStep = 5,
  defaultTicketValue = 3500,
  minTicketValue = 500,
  maxTicketValue = 15000,
  ticketStep = 500,
  defaultCloseRate = 20,
  minCloseRate = 5,
  maxCloseRate = 60,
  closeRateStep = 5,
  customSubResult,
}: RoiCalculatorProps) => {
  // States with intelligent defaults for trade businesses
  const [leads, setLeads] = useState<number>(defaultLeads);
  const [ticketValue, setTicketValue] = useState<number>(defaultTicketValue);
  const [closeRate, setCloseRate] = useState<number>(30); // Percentage

  // Calculations
  const calculations = useMemo(() => {
    // 12% close rate lift implies recovering 12% of total leads
    const recoveredJobs = leads * 0.12;
    const additionalRevenue = Math.round(recoveredJobs * ticketValue);

    const systemCost = 997;
    const roi = Math.round(
      ((additionalRevenue - systemCost) / systemCost) * 100,
    );

    return {
      recoveredJobs: Number(recoveredJobs.toFixed(1)),
      additionalRevenue,
      systemCost,
      roi,
    };
  }, [leads, ticketValue]);

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto scroll-mt-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-accent" />
          <span className="label text-accent">ROI Calculator</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-outfit tracking-tight leading-tight mb-4">
          What's this worth to <br className="hidden md:block" />
          <span className="text-accent">your business?</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See how much revenue is slipping through the cracks when leads wait
          hours (or days) for a response instead of seconds.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Interactive Controls */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8 p-8 rounded-3xl bg-card border-2 border-border/50 shadow-sm"
        >
          {/* Monthly Leads Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Monthly leads
                </label>
                <p className="text-xs text-muted-foreground">
                  Total inbound inquiries
                </p>
              </div>
              <span className="font-display font-bold text-2xl text-accent">
                {leads}
              </span>
            </div>
            <input
              type="range"
              min={minLeads}
              max={maxLeads}
              step={leadsStep}
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Average Ticket Value Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-accent" />
                  Average job value
                </label>
                <p className="text-xs text-muted-foreground">
                  Revenue per booked job
                </p>
              </div>
              <span className="font-display font-bold text-2xl text-accent">
                {currencySymbol}
                {ticketValue.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={minTicketValue}
              max={maxTicketValue}
              step={ticketStep}
              value={ticketValue}
              onChange={(e) => setTicketValue(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Current Close Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Current close rate
                </label>
                <p className="text-xs text-muted-foreground">
                  Leads that become paying jobs
                </p>
              </div>
              <span className="font-display font-bold text-2xl text-accent">
                {closeRate}%
              </span>
            </div>
            <input
              type="range"
              min={minCloseRate}
              max={maxCloseRate}
              step={closeRateStep}
              value={closeRate}
              onChange={(e) => setCloseRate(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </motion.div>

        {/* Right: Results Display */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col h-full"
        >
          <Card className="border-2 border-accent/20 bg-accent/5 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <CardContent className="p-8 md:p-10 relative z-10 flex flex-col gap-6 justify-center h-full text-center items-center">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  AutomEdge could recover
                </p>
                <p className="font-display text-5xl md:text-7xl font-black text-foreground tracking-tight">
                  <span className="text-accent animate-pulse-indicator inline-block mr-1">
                    {currencySymbol}
                  </span>
                  {calculations.additionalRevenue.toLocaleString()}{" "}
                  <span className="text-3xl font-bold text-muted-foreground">
                    / month
                  </span>
                </p>

                <div className="text-sm font-semibold text-muted-foreground bg-background/60 border border-border/50 py-2.5 px-6 rounded-full inline-flex flex-wrap items-center justify-center tracking-wide gap-2">
                  <span>
                    System cost: {currencySymbol}
                    {calculations.systemCost.toLocaleString()}/mo
                  </span>
                  <span className="font-black text-lg opacity-50">·</span>
                  <span className="text-accent">
                    {customSubResult
                      ? customSubResult
                      : `ROI: ${calculations.roi.toLocaleString()}%`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-accent/10">
                <Link href="#demo" className="w-full">
                  <button className="w-full btn-cta glow-cta shadow-lg py-4 group">
                    Start Recovering Jobs
                    <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  *Calculation assumes recovering 20% of your currently
                  unconverted leads.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
