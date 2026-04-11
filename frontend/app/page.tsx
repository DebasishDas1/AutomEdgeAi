import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
import { HeroBlock } from "@/components/ui/hero-block-shadcnui";

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
    images: [{ url: "/hvac.png" }], // Using an existing image as og-image
  },
};

export default function Homepage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />
      <HeroBlock />
      {/* <ModernHero /> */}

      <div className="space-y-32 pb-12">
        <ProblemSection problems={PROBLEMS} />
        <HowItWorks />
        <SolutionSection solutions={SOLUTIONS} />
        <DemoWorkflowSection />
        <ImpactSection impacts={IMPACTS} />
        <LogoCloud />
        <FAQSection faqs={FAQS} />
        <ContactSection />
        <Footer />
      </div>

      {/* <Footer /> */}

      {/* Subtle background decoration */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
    </main>
  );
}
