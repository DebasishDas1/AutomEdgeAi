import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
import { HeroBlock } from "@/components/ui/hero-block-shadcnui";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { PROBLEMS, SOLUTIONS, IMPACTS, FAQS } from "./constants";

// Below the fold - Dynamic
const placeholder = () => <div className="min-h-75 bg-background" />;

const ProblemSection = dynamic(
  () => import("@/components/ProblemSection").then((mod) => mod.ProblemSection),
  { loading: placeholder },
);
const HowItWorks = dynamic(
  () => import("@/components/HowItWorks").then((mod) => mod.HowItWorks),
  { loading: placeholder },
);
const SolutionSection = dynamic(
  () =>
    import("@/components/SolutionSection").then((mod) => mod.SolutionSection),
  { loading: placeholder },
);
const DemoWorkflowSection = dynamic(
  () =>
    import("@/components/DemoWorkflowSection").then(
      (mod) => mod.DemoWorkflowSection,
    ),
  { loading: placeholder },
);
const ImpactSection = dynamic(
  () => import("@/components/ImpactSection").then((mod) => mod.ImpactSection),
  { loading: placeholder },
);
const LogoCloud = dynamic(
  () => import("@/components/LogoCloud").then((mod) => mod.LogoCloud),
  { loading: placeholder },
);
const FAQSection = dynamic(
  () => import("@/components/FAQSection").then((mod) => mod.FAQSection),
  { loading: placeholder },
);
const ContactSection = dynamic(
  () => import("@/components/ContactSection").then((mod) => mod.ContactSection),
  { loading: placeholder },
);
const Footer = dynamic(
  () => import("@/components/ui/large-name-footer").then((mod) => mod.Footer),
  { loading: placeholder },
);

export const metadata: Metadata = {
  title: "Stop Losing Jobs to Slow Follow-Up | AutomEdge AI",
  description:
    "AutomEdge responds to every HVAC, Roofing, and Plumbing lead in <60 seconds. Our AI qualifies, books, and follows up automatically so you can focus on the job.",
  openGraph: {
    title: "Stop Losing Jobs to Slow Follow-Up | AutomEdge AI",
    description:
      "Respond to every lead in <60 seconds. Our AI qualifies, books, and follows up automatically.",
    images: [{ url: "https://automedgeai.com/hvac.png" }],
    type: "website",
    url: "https://automedgeai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutomEdge AI — Lead Automation for Service Businesses",
    description: "Respond to leads in <60s, qualify, and book automatically.",
    images: ["https://automedgeai.com/hvac.png"],
  },
  alternates: {
    canonical: "https://automedgeai.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AutomEdge AI",
  url: "https://automedgeai.com",
  logo: "https://automedgeai.com/logo.png",
  description:
    "AI lead automation for service-based businesses like HVAC, Roofing, and Plumbing.",
  sameAs: [
    "https://twitter.com/automedgeai",
    "https://linkedin.com/company/automedgeai",
  ],
};

export default function Homepage() {
  return (
    <main className="min-h-screen relative bg-background overflow-x-hidden selection:bg-accent/30 selection:text-accent-foreground font-sans">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      <HeroBlock />

      <div className="space-y-32 pb-24 md:pb-32">
        <ScrollReveal>
          <div className="space-y-32">
            <ProblemSection problems={PROBLEMS} />
            <HowItWorks />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-32">
            <SolutionSection solutions={SOLUTIONS} />
            <DemoWorkflowSection />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <ImpactSection impacts={IMPACTS} />
        </ScrollReveal>

        <ScrollReveal>
          <LogoCloud />
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-32">
            <FAQSection faqs={FAQS} />
            <ContactSection />
          </div>
        </ScrollReveal>

        <Footer />
      </div>
    </main>
  );
}
