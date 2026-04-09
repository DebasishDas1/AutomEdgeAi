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

export const metadata: Metadata = {
  title: "Automedge Ads | Self-Service Advertising",
  description:
    "Self-service advertising solutions designed for businesses of all sizes, including small businesses and authors.",
};

export default function AdsPage() {
  return (
    <main className="min-h-screen relative flex flex-col bg-background selection:bg-accent/30 overflow-hidden">
      <Navbar />

      {/* Decorative Backgrounds */}
      <div className="absolute top-0 right-0 w-200 h-200 bg-accent/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-150 h-150 bg-primary/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto w-full text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent font-medium text-sm mb-8">
          <Zap className="w-4 h-4 fill-current" />
          Introducing Automedge Ads
        </div>
        <h1 className="text-6xl md:text-8xl font-outfit font-black tracking-tighter mb-8 leading-tight">
          Grow Your Business <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            With Precision.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-sans font-medium max-w-3xl mx-auto mb-12">
          Easy-to-use, self-service advertising solutions designed for
          businesses of all sizes. Reach your exact audience, measure every
          click, and scale efficiently.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="w-full sm:w-auto px-10 py-5 rounded-full bg-foreground text-background font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-2xl"
          >
            Start Advertising
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-10 py-5 rounded-full bg-card border-2 border-border text-foreground font-bold text-lg hover:bg-accent/5 transition-all flex items-center justify-center"
          >
            Explore Solutions
          </Link>
        </div>
      </section>

      {/* For Everyone Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-outfit font-black mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-muted-foreground">
              Tailored advertising tools whether you are a local shop or a
              global brand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-4">
                Small Businesses
              </h3>
              <p className="text-muted-foreground">
                Drive foot traffic and local awareness. Target customers within
                a specific radius of your storefront with localized campaigns.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-4">
                Authors & Creators
              </h3>
              <p className="text-muted-foreground">
                Get your work in front of readers who love your genre. Optimize
                for direct sales, newsletter sign-ups, or page reads.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-4">
                Agencies & Enterprise
              </h3>
              <p className="text-muted-foreground">
                Manage multiple client accounts from a single dashboard. Access
                advanced reporting, bulk editing, and priority support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-accent/5 relative z-10 border-y border-border"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-outfit font-black leading-tight">
              Powerful tools, <br />
              <span className="text-accent">zero complexity.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              You don&apos;t need a marketing degree to run successful campaigns. Our
              AI-driven platform handles the heavy lifting of bidding and
              optimization so you can focus on your business.
            </p>
            <ul className="space-y-6">
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
                <li key={idx} className="flex gap-4">
                  <div className="mt-1 w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-outfit">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Dashboard Mockup */}
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card aspect-4/3 flex flex-col">
              {/* Fake Window Header */}
              <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-muted-foreground font-medium mb-1">
                      Total Return on Ad Spend
                    </div>
                    <div className="text-4xl font-black font-outfit text-accent">
                      420%
                    </div>
                  </div>
                  <div className="w-16 h-12 rounded-lg bg-accent/20 flex items-center justify-center relative overflow-hidden">
                    <BarChart3 className="text-accent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Clicks
                    </div>
                    <div className="text-xl font-bold">12,482</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Conversions
                    </div>
                    <div className="text-xl font-bold">843</div>
                  </div>
                </div>
                {/* Fake Chart */}
                <div className="h-28 rounded-2xl bg-linear-to-b from-blue-500/10 to-transparent border-t border-blue-500/20 w-full relative mt-4"></div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-background border border-border shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Campaign Status
                </div>
                <div className="font-bold text-green-500">Optimizing...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10 text-center">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <h2 className="text-5xl font-outfit font-black mb-6">
          Ready to reach your audience?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Create campaigns in minutes, track your success in real-time, and only
          pay when people click your ads.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-12 py-6 rounded-full bg-accent text-accent-foreground font-black text-xl hover:scale-105 transition-all shadow-xl shadow-accent/20"
        >
          Create Your First Campaign
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
