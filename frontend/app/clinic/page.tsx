import { Metadata } from "next";
import dynamic from "next/dynamic";

import {
  PROBLEMS,
  SOLUTIONS,
  STEPS,
  SERVICES,
  IMPACTS,
  TESTIMONIALS,
} from "./constants";

import { SectionSkeleton } from "@/components/shared/SectionSkeleton";
import { PositioningSection } from "@/components/PositioningSection";
import { DemoPageNavbar } from "@/components/shared/DemoPageNavbar";
import { DirectContactSection } from "@/components/DirectContactSection";
import { YoutubeEmbed } from "@/components/shared/YoutubeEmbed";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ClinicHero } from "@/components/ClinicHero";

// 🔹 dynamic imports
const ProblemSection = dynamic(
  () => import("@/components/ProblemSection").then((m) => m.ProblemSection),
  { loading: () => <SectionSkeleton /> },
);

const SolutionSection = dynamic(
  () => import("@/components/SolutionSection").then((m) => m.SolutionSection),
  { loading: () => <SectionSkeleton /> },
);

const ServicesSection = dynamic(
  () => import("@/components/ServicesSection").then((m) => m.ServicesSection),
  { loading: () => <SectionSkeleton /> },
);

const DemoFullSystem = dynamic(
  () =>
    import("@/components/shared/DemoFullSystem").then((m) => m.DemoFullSystem),
  { loading: () => <SectionSkeleton /> },
);

const ImpactSection = dynamic(
  () => import("@/components/ImpactSection").then((m) => m.ImpactSection),
  { loading: () => <SectionSkeleton /> },
);

const DemoPageCalendar = dynamic(() =>
  import("@/components/shared/DemoPageCalendar").then(
    (mod) => mod.DemoPageCalendar,
  ),
);

const TestimonialSection = dynamic(
  () =>
    import("@/components/TestimonialSection").then(
      (m) => m.CircularTestimonialsDemo,
    ),
  { loading: () => <SectionSkeleton /> },
);

export const metadata: Metadata = {
  title:
    "See AI Book Clinic Appointments in 60 Seconds — Live Demo | AutomEdgeAi",
  description:
    "Watch AutomEdge respond to a clinic lead, qualify the issue, and book the appointment automatically.",
  openGraph: {
    title: "Live Clinic Demo — AutomEdgeAi",
    description:
      "Watch AutomEdgeAi respond to a clinic lead, qualify the issue, and book the appointment automatically.",
    images: ["/clinic.png"],
    type: "website",
    url: "https://automedgeai.com/clinic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Clinic Demo — AutomEdgeAi",
    description:
      "Watch AutomEdgeAi respond to a clinic lead, qualify the issue, and book the appointment automatically.",
    images: ["/clinic.png"],
  },
  alternates: {
    canonical: "https://automedgeai.com/clinic",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Live Clinic Demo — AutomEdgeAi",
  description: "Watch AI book clinic appointments automatically in real time.",
  publisher: {
    "@type": "Organization",
    name: "AutomEdgeAi",
    logo: {
      "@type": "ImageObject",
      url: "https://automedgeai.com/logo.png",
    },
  },
};

const navItems = [
  { label: "Problems", href: "#problem" },
  { label: "Solutions", href: "#solution" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "Impact", href: "#impact" },
  { label: "Watch Live Demo", href: "#youtube-demo" },
  { label: "Direct Contact", href: "#direct-contact" },
];

export default function ClinicPage() {
  return (
    <main className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15]" />
      </div>

      <DemoPageNavbar navItems={navItems} iconLink="/clinic" />

      <ScrollReveal direction="down" distance={30}>
        <ClinicHero />
      </ScrollReveal>

      <div className="space-y-24 md:space-y-36 pb-24 md:pb-32">
        <ScrollReveal>
          <ProblemSection problems={PROBLEMS} />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SolutionSection solutions={SOLUTIONS} />
        </ScrollReveal>

        <ScrollReveal>
          <DemoFullSystem steps={STEPS} />
        </ScrollReveal>

        <ScrollReveal>
          <ServicesSection services={SERVICES} />
        </ScrollReveal>

        <ScrollReveal>
          <ImpactSection impacts={IMPACTS} />
        </ScrollReveal>

        <ScrollReveal>
          <TestimonialSection testimonials={TESTIMONIALS} />
        </ScrollReveal>

        <ScrollReveal>
          <PositioningSection />
        </ScrollReveal>

        <ScrollReveal>
          <section
            id="youtube-demo"
            className="text-center space-y-10 py-20 px-4"
          >
            <div className="space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-outfit font-black tracking-tight leading-none">
                See It Book Appointments <br className="hidden md:block" />
                <span className="text-accent">in Real Time</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium">
                From incoming lead → AI response → confirmed booking.{" "}
                <br className="hidden md:block" />
                No human needed. Available 24/7.
              </p>
            </div>

            <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-2">
              <YoutubeEmbed videoId="bDDlgM686Ds" />
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <DemoPageCalendar
            title="Ready to see it in action?"
            highlight="Book a 15-minute demo"
            description="15 minutes. We show you exactly what this looks like built for your business — your branding, your calendar, your CRM. No pitch. No pressure."
            type="clinic"
          />
        </ScrollReveal>

        <ScrollReveal>
          <DirectContactSection
            whatsappNumber={"9073896612"}
            email={"team.automedgeai@gmail.com"}
          />
        </ScrollReveal>
      </div>
    </main>
  );
}
