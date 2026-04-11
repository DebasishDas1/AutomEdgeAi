"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 🔹 Shared styles (clean + reusable)
const cardStyle =
  "rounded-2xl border border-border bg-card backdrop-blur-md shadow-sm";

const sectionPadding = "p-5 md:p-6";

// --- Data (unchanged) ---
const DASHBOARD_DATA = {
  date: "Today, Apr 10",
  metrics: [
    {
      title: "New leads today",
      value: "24",
      subtext: "+6 vs yesterday",
      color: "text-[#76C179]",
    },
    {
      title: "Avg response time",
      value: "4m",
      subtext: "vs 11hr industry avg",
      color: "text-[#76C179]",
    },
    {
      title: "Hot leads",
      value: "9",
      subtext: "3 unassigned",
      color: "text-[#E56C6C]",
    },
    {
      title: "Team conversion",
      value: "18%",
      subtext: "+2% this week",
      color: "text-[#76C179]",
    },
  ],
  recentActivity: [
    {
      type: "Hot",
      name: "Marcus T.",
      platform: "Instagram",
      snippet: "Looking to buy a 3BR in Austin under $450K",
      time: "2m ago",
      color: "bg-[#E56C6C]/10 text-[#E56C6C] border-[#E56C6C]/30",
    },
    {
      type: "Warm",
      name: "Sarah L.",
      platform: "Facebook",
      snippet: "Just exploring, curious about downtown condos",
      time: "8m ago",
      color: "bg-[#E5A642]/10 text-[#E5A642] border-[#E5A642]/30",
    },
    {
      type: "Cold",
      name: "David P.",
      platform: "Email",
      snippet: "What are current interest rates?",
      time: "14m ago",
      color: "bg-gray-400/10 text-gray-400 border-gray-400/30",
    },
    {
      type: "Hot",
      name: "Priya K.",
      platform: "Instagram",
      snippet: "Need to move in 30 days, pre-approved at $600K",
      time: "21m ago",
      color: "bg-[#E56C6C]/10 text-[#E56C6C] border-[#E56C6C]/30",
    },
  ],
  leadSources: [
    { label: "Instagram", value: 80, count: 9, color: "bg-[#4194F2]" },
    { label: "Facebook", value: 65, count: 7, color: "bg-[#46C39F]" },
    { label: "Email", value: 45, count: 5, color: "bg-[#F26A4B]" },
    { label: "Website", value: 30, count: 3, color: "bg-[#8A8A8A]" },
  ],
  staleLeads: [
    { name: "Michael B.", status: "no reply 4h" },
    { name: "Anna W.", status: "no reply 6h" },
    { name: "Tom G.", status: "no reply 9h" },
  ],
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-1 w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <div className="text-sm text-muted-foreground font-medium">
            {DASHBOARD_DATA.date}
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {DASHBOARD_DATA.metrics.map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>

        {/* Activity */}
        <Card className={cardStyle}>
          <CardContent className={cn(sectionPadding, "space-y-5")}>
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <div className="space-y-5">
              {DASHBOARD_DATA.recentActivity.map((activity, i) => (
                <ActivityItem key={i} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className={cardStyle}>
            <CardContent className={sectionPadding}>
              <h2 className="text-lg font-semibold mb-5">Lead sources today</h2>
              <div className="space-y-5">
                {DASHBOARD_DATA.leadSources.map((source, i) => (
                  <SourceProgress key={i} {...source} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyle}>
            <CardContent className={sectionPadding}>
              <h2 className="text-lg font-semibold mb-5">
                Stale leads — needs action
              </h2>
              <div className="space-y-4">
                {DASHBOARD_DATA.staleLeads.map((lead, i) => (
                  <StaleLead key={i} {...lead} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function MetricCard({
  title,
  value,
  subtext,
  color,
}: (typeof DASHBOARD_DATA.metrics)[0]) {
  return (
    <Card className="rounded-2xl bg-card backdrop-blur-md border border-border">
      <CardContent className="p-5 space-y-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        <div className="text-3xl md:text-4xl font-bold">{value}</div>
        <div className={cn("text-xs font-semibold", color)}>{subtext}</div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  type,
  name,
  platform,
  snippet,
  time,
  color,
}: (typeof DASHBOARD_DATA.recentActivity)[0]) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-3 flex-1">
        <Badge
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded border w-14 justify-center",
            color,
          )}
        >
          {type}
        </Badge>

        <p className="text-sm leading-tight">
          <span className="font-medium">
            {name} via {platform}
          </span>
          <span className="mx-2 text-muted-foreground">—</span>
          <span className="italic text-muted-foreground">"{snippet}"</span>
        </p>
      </div>

      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {time}
      </div>
    </div>
  );
}

function SourceProgress({
  color,
  label,
  value,
  count,
}: (typeof DASHBOARD_DATA.leadSources)[0]) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <div className="w-24 text-sm font-medium">{label}</div>

      <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            color,
          )}
          style={{ width: `${value}%` }}
        />
      </div>

      <div className="w-6 text-right text-sm font-semibold text-muted-foreground">
        {count}
      </div>
    </div>
  );
}

function StaleLead({ name, status }: (typeof DASHBOARD_DATA.staleLeads)[0]) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">
        <span className="font-medium">{name}</span>
        <span className="mx-2 text-muted-foreground">—</span>
        <span className="text-muted-foreground">{status}</span>
      </div>

      <Button variant="outline" className="rounded-lg px-3 h-8 text-xs">
        Reassign
      </Button>
    </div>
  );
}
