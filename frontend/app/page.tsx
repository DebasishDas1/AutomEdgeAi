import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { ModernHero } from "@/components/ModernHero";
import type { Metadata } from "next";
import { HeroBlock } from "@/components/ui/hero-block-shadcnui";

// Above the fold - Static
// Navbar and ModernHero remain static for immediate LCP

// Below the fold - Dynamic
const placeholder = () => <div className="min-h-[300px] bg-background" />;

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

const FAQS = [
  {
    question: "What industries does Automedge AI serve?",
    answer:
      "Automedge AI is specifically built for service-based businesses, primarily focusing on HVAC, Roofing, Plumbing, and other trade services that rely on rapid lead response.",
  },
  {
    question: "How quickly can I get started with Automedge AI?",
    answer:
      "Most businesses can get their AI sales engine up and running within 24 to 48 hours. Our team handles the initial setup and model training for you.",
  },
  {
    question: "What happens to leads that aren't ready to book immediately?",
    answer:
      "The AI automatically puts them into a nurturing sequence. It checks in via text or WhatsApp at strategic intervals to answer questions and keep your business top-of-mind.",
  },
  {
    question: "Can I integrate Automedge AI with my existing CRM?",
    answer:
      "Yes, we support native integrations with major CRMs like ServiceTitan, Housecall Pro, and HubSpot, as well as thousands of others through Zapier.",
  },
  {
    question: "What kind of analytics and reporting do I get?",
    answer:
      "You get a real-time dashboard showing exactly how many leads were captured, qualified, and booked, along with detailed conversation transcripts and conversion rate trends.",
  },
];

export default function Homepage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />
      <HeroBlock />
      {/* <ModernHero /> */}

      <div className="space-y-32 pb-12">
        <ProblemSection />
        <HowItWorks />
        <SolutionSection />
        <DemoWorkflowSection />
        <ImpactSection />
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
