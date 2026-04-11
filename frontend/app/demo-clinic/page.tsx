import { Metadata } from "next";
import dynamic from "next/dynamic";

import { DemoPageHero } from "@/components/shared/DemoPageHero";
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

const TestimonialSection = dynamic(
  () =>
    import("@/components/TestimonialSection").then(
      (m) => m.CircularTestimonialsDemo,
    ),
  { loading: () => <SectionSkeleton /> },
);

export const metadata: Metadata = {
  title:
    "See AI Book Clinic Appointments in 60 Seconds — Live Demo | AutomEdge",
  description:
    "Watch AutomEdge respond to a clinic lead, qualify the issue, and book the appointment automatically.",
  openGraph: {
    title: "Live Clinic Demo — AutomEdge",
    description:
      "Watch AutomEdge respond to a clinic lead, qualify the issue, and book the appointment automatically.",
    images: ["/clinic.png"],
  },
  twitter: {
    title: "Live Clinic Demo — AutomEdge",
    description:
      "Watch AutomEdge respond to a clinic lead, qualify the issue, and book the appointment automatically.",
    images: ["/clinic.png"],
  },
};

export default function ClinicPage() {
  return (
    <main className="min-h-screen w-full">
      <DemoPageHero
        title="See How Clinics Book"
        highlight="30% More Patients"
        subTitle="Without Hiring Anyone."
        description="Automatically capture calls, WhatsApp inquiries, and website leads — and turn them into booked appointments without adding more staff."
        tags={[
          "No app needed",
          "Real SMS to your phone",
          "90 seconds to see it",
        ]}
      />

      <div className="space-y-20 md:space-y-28 pb-16 md:pb-24">
        <ProblemSection problems={PROBLEMS} />
        <SolutionSection solutions={SOLUTIONS} />
        <DemoFullSystem steps={STEPS} />
        <ServicesSection services={SERVICES} />
        <ImpactSection impacts={IMPACTS} />
        <TestimonialSection testimonials={TESTIMONIALS} />
        <PositioningSection />
      </div>
    </main>
  );
}
