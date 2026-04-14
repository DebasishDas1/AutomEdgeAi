import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/large-name-footer";
import {
  ArrowRight,
  BarChart3,
  Megaphone,
  Target,
  Zap,
  BookOpen,
  Store,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Automedge Ads | Self-Service Advertising",
  description:
    "Self-service advertising solutions designed for businesses of all sizes, including small businesses and authors.",
  openGraph: {
    title: "AutomEdge Ads",
    description: "Self-service advertising solutions for growing businesses.",
    type: "website",
    url: "https://automedgeai.com/ads",
  },
  alternates: {
    canonical: "https://automedgeai.com/ads",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AutomEdge Ads",
  description: "Self-service advertising solutions for growing businesses.",
  url: "https://automedgeai.com/ads",
};

export default function AdsPage() {
  return (
    <main className="min-h-screen relative flex flex-col bg-background selection:bg-accent/30 overflow-x-hidden font-sans">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto w-full text-center relative z-10">
        <ScrollReveal direction="down" distance={30}>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-accent/20 bg-accent/5 text-accent font-black text-xs md:text-sm mb-10 shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
            INTRODUCING AUTOMEDGE ADS
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-6xl md:text-8xl font-outfit font-black tracking-tighter mb-8 leading-[1.1]">
            Grow Your Business <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-primary animate-gradient">
              With Precision.
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-xl md:text-2xl text-muted-foreground font-sans font-medium max-w-3xl mx-auto mb-12 opacity-90 leading-relaxed">
            Easy-to-use, self-service advertising solutions designed for
            businesses of all sizes. Reach your exact audience, measure every
            click, and scale efficiently.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-12 py-5 rounded-full bg-foreground text-background font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group shadow-2xl"
            >
              Start Advertising
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-12 py-5 rounded-full bg-card/60 backdrop-blur-md border-2 border-border/80 text-foreground font-black text-xl hover:bg-accent/5 transition-all flex items-center justify-center shadow-lg"
            >
              Explore Solutions
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* For Everyone Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-outfit font-black mb-6 tracking-tight">
                Built for Everyone
              </h2>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Tailored advertising tools whether you are a local shop or a
                global brand.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="p-10 h-full rounded-[3rem] bg-card/40 backdrop-blur-2xl border-2 border-border/50 shadow-xl hover:-translate-y-3 transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-8 ring-4 ring-blue-500/5 group-hover:scale-110 transition-transform">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black font-outfit mb-4 tracking-tight">
                  Small Businesses
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  &quot;Drive foot traffic and local awareness with precise
                  geo-targeting.&quot;
                </p>
                <p className="text-muted-foreground mt-4 font-medium leading-relaxed">
                  Target customers within a specific radius of your storefront
                  with localized campaigns.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="p-10 h-full rounded-[3rem] bg-card/40 backdrop-blur-2xl border-2 border-border/50 shadow-xl hover:-translate-y-3 transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-8 ring-4 ring-accent/5 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black font-outfit mb-4 tracking-tight">
                  Authors & Creators
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  &quot;Get your work in front of readers who love your
                  genre.&quot;
                </p>
                <p className="text-muted-foreground mt-4 font-medium leading-relaxed">
                  Optimize for direct sales, newsletter sign-ups, or page reads
                  with smart audience segments.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="p-10 h-full rounded-[3rem] bg-card/40 backdrop-blur-2xl border-2 border-border/50 shadow-xl hover:-translate-y-3 transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-8 ring-4 ring-orange-500/5 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black font-outfit mb-4 tracking-tight">
                  Agencies
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  &quot;Manage multiple client accounts from a single
                  dashboard.&quot;
                </p>
                <p className="text-muted-foreground mt-4 font-medium leading-relaxed">
                  Access advanced reporting, bulk editing, and priority support
                  to scale your clients.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section
        id="how-it-works"
        className="py-32 px-6 bg-accent/5 relative z-10 border-y-2 border-border/50"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <ScrollReveal direction="left">
              <h2 className="text-5xl md:text-6xl font-outfit font-black leading-tight tracking-tight">
                Powerful tools, <br />
                <span className="text-accent underline decoration-8 underline-offset-8">
                  zero complexity.
                </span>
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.1}>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                You don&apos;t need a marketing degree to run successful
                campaigns. Our AI-driven platform handles the heavy lifting of
                bidding and optimization so you can focus on your business.
              </p>
            </ScrollReveal>

            <ul className="space-y-8">
              {[
                {
                  title: "Smart Targeting",
                  description:
                    "Automatically match your ads with users actively searching for your services.",
                  icon: <Target className="w-6 h-6 text-accent" />,
                },
                {
                  title: "Transparent Bidding",
                  description:
                    "You set the budget. We ensure you get the maximum possible return on ad spend.",
                  icon: <Megaphone className="w-6 h-6 text-accent" />,
                },
                {
                  title: "Real-time Analytics",
                  description:
                    "Track impressions, clicks, and conversions in a clean, intuitive dashboard.",
                  icon: <BarChart3 className="w-6 h-6 text-accent" />,
                },
              ].map((feature, idx) => (
                <ScrollReveal
                  key={idx}
                  direction="left"
                  delay={0.2 + idx * 0.1}
                >
                  <li className="flex gap-6 items-start group">
                    <div className="mt-1 w-14 h-14 rounded-2xl bg-background border-2 border-border/80 flex items-center justify-center shrink-0 shadow-xl group-hover:border-accent/40 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black font-outfit mb-1 tracking-tight">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground font-medium text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>

          <ScrollReveal direction="right" distance={40}>
            <div className="relative">
              {/* Dashboard Mockup */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-card border-b-8 aspect-4/3 flex flex-col group">
                {/* Fake Window Header */}
                <div className="h-14 bg-muted/50 border-b-2 border-border flex items-center px-6 gap-3">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto text-xs font-bold text-muted-foreground/50 tracking-widest uppercase">
                    ads.automedge.ai
                  </div>
                </div>
                {/* Fake Dashboard Content */}
                <div className="flex-1 p-8 space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                        Return on Ad Spend
                      </div>
                      <div className="text-5xl font-black font-outfit text-accent">
                        420%
                      </div>
                    </div>
                    <div className="w-16 h-12 rounded-xl bg-accent/20 flex items-center justify-center relative overflow-hidden ring-2 ring-accent/10">
                      <BarChart3 className="text-accent w-6 h-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-muted/30 border-2 border-border shadow-inner">
                      <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                        Clicks
                      </div>
                      <div className="text-2xl font-black">12,482</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/30 border-2 border-border shadow-inner">
                      <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                        Conversions
                      </div>
                      <div className="text-2xl font-black">843</div>
                    </div>
                  </div>
                  {/* Fake Chart */}
                  <div className="h-28 rounded-2xl bg-linear-to-b from-blue-500/15 via-blue-500/5 to-transparent border-t-2 border-blue-500/30 w-full relative mt-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-end px-2 pb-2 gap-1">
                      {[0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.9, 0.7, 0.85].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-accent/30 rounded-t-sm"
                            style={{ height: `${h * 100}%` }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 -left-8 p-6 rounded-3xl bg-background border-2 border-border shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex items-center gap-5 z-20">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 ring-4 ring-green-500/5">
                  <Zap className="w-7 h-7 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                    System AI
                  </div>
                  <div className="font-black text-xl text-foreground">
                    Optimizing Bids...
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative z-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />

        <ScrollReveal>
          <h2 className="text-5xl md:text-7xl font-outfit font-black mb-8 tracking-tighter">
            Ready to reach <br className="md:hidden" /> your audience?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Create campaigns in minutes, track your success in real-time, and
            only pay when people click your ads.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-14 py-7 rounded-full bg-accent text-accent-foreground font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20 group"
          >
            Create Your First Campaign
            <ArrowRight className="w-7 h-7 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
