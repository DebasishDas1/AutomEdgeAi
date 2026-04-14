import dynamic from "next/dynamic";
import { Metadata } from "next";

// Above the fold - static
import { DemoPageNavbar } from "@/components/shared/DemoPageNavbar";
import { DemoPageHero } from "@/components/shared/DemoPageHero";
import { DemoPageFooter } from "@/components/shared/DemoPageFooter";
import { ChatbotWrapper } from "@/components/shared/ChatbotWrapper";
import { CallAgent } from "@/components/shared/CallAgent";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const DemoFullSystem = dynamic(() =>
  import("@/components/shared/DemoFullSystem").then(
    (mod) => mod.DemoFullSystem,
  ),
);
const RoiCalculator = dynamic(() =>
  import("@/components/shared/RoiCalculator").then((mod) => mod.RoiCalculator),
);
const FAQSection = dynamic(() =>
  import("@/components/FAQSection").then((mod) => mod.FAQSection),
);
const DemoPageCalendar = dynamic(() =>
  import("@/components/shared/DemoPageCalendar").then(
    (mod) => mod.DemoPageCalendar,
  ),
);

export const metadata: Metadata = {
  title: "See AI Book Pest Control Jobs in 60 Seconds — Live Demo | AutomEdge",
  description:
    "Pest leads are urgent. See AutomEdge respond, identify the pest, and book a treatment automatically. Try the live demo — real SMS in under 60 seconds.",
  openGraph: {
    title: "Live Pest Control Demo — AutomEdge",
    description:
      "Pest leads are urgent. See AutomEdge respond, identify the pest, and book a treatment automatically.",
    images: ["/pest_control.png"],
    type: "website",
    url: "https://automedgeai.com/demo-pest-control",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Pest Control Demo — AutomEdge",
    description:
      "Pest leads are urgent. See AutomEdge respond, identify the pest, and book a treatment automatically.",
    images: ["/pest_control.png"],
  },
  alternates: {
    canonical: "https://automedgeai.com/demo-pest-control",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Live Pest Control Demo — AutomEdge",
  description: "Watch AI book pest control jobs automatically in real time.",
  publisher: {
    "@type": "Organization",
    name: "AutomEdgeAi",
    logo: {
      "@type": "ImageObject",
      url: "https://automedgeai.com/logo.png",
    },
  },
};

const FAQS = [
  {
    question: "Does it handle both residential and commercial accounts?",
    answer:
      "Yes. Commercial leads get routed to a separate sequence with business-appropriate language and pricing context.",
  },
  {
    question: "What about emergency calls — active infestations?",
    answer:
      "Leads flagged Active or Emergency trigger an immediate notification to your on-call tech via SMS. You define what counts as an emergency — we build the rule.",
  },
  {
    question: "Can it sell quarterly maintenance plans automatically?",
    answer:
      "Yes — this is one of the highest-value automations for pest control. The 30-day and 90-day post-treatment sequences pitch your maintenance plans automatically. Most clients see 20–30% plan conversion from this alone.",
  },
  {
    question: "What if a customer complains about the treatment?",
    answer:
      'Any reply containing "complaint," "sick," or "reaction" gets flagged immediately and forwarded to you. The AI never handles complaints — it escalates them instantly.',
  },
  {
    question: "Is there a contract?",
    answer: "Month-to-month. Cancel any time. No fees.",
  },
];

const STEPS = [
  {
    title: "Instant Pest Inquiry Response",
    description: "",
    message:
      "Hi Tom here from Sunbelt Shield. Got your message — we'll get this sorted fast. Are you seeing the pests themselves or just signs?",
    smallWin:
      "Pest control is the most urgency-driven home service. First reply wins",
  },
  {
    title: "AI Pest Qualifier + Priority Tagging",
    description:
      "Identifies pest type, severity, and property type. Tags leads as Routine, Active, or Emergency. Emergency leads notify your on-call tech instantly.",
    message:
      "Got it. And is this in just the kitchen, or other rooms too? Helps us bring the right treatment.",
    smallWin: "Techs arrive prepared. No wrong products, no return visits.",
  },
  {
    title: "Treatment Booking",
    description:
      "Offers same-day or next-morning slots. Customer books in 30 seconds. Calendar updates instantly.",
    message:
      "We can be there today at 4pm or tomorrow at 9am. Here's your slot: [link]. Takes 30 seconds.",
    smallWin:
      "Urgency converts. The booking flow matches the emotional moment.",
  },
  {
    title: "Pre-Treatment Prep Instructions",
    description:
      "Night before the appointment, the system sends prep instructions — clear under sinks, store pet food. Reduces failed treatments and return visits.",
    message:
      "Reminder: Tomorrow 9–11am. For best results: clear under your kitchen sink and store pet food in sealed containers tonight.",
    smallWin:
      "Prepared customers = effective first treatments = 5-star reviews.",
  },
  {
    title: "Quarterly Plan Upsell (30/60/90 days)",
    description:
      "After treatment, the system follows up at 30, 60, and 90 days — checks results, offers quarterly plans. Your highest-margin recurring revenue, automated.",
    message:
      "Hi been 30 days since your roach treatment — all clear? Ask us about our quarterly prevention plan — most clients save $200+ annually.",
    smallWin:
      "One-time jobs have low margin. Quarterly plans are your profit engine.",
  },
  {
    title: "Review Generation",
    description: "2 hours post-treatment, automated Google review request.",
    message:
      "Hope you're pest-free! 🙏 If we did a great job, a quick Google review helps us a lot: [link]",
    smallWin: "More reviews = Google ranks you higher = free leads.",
  },
];

const navItems = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Roi Calculator", href: "#roi" },
  { label: "Faq", href: "#faq" },
];

export default function PestControlPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      <DemoPageNavbar navItems={navItems} />

      <ScrollReveal direction="down" distance={20}>
        <CallAgent type={"pest_control"} />
      </ScrollReveal>

      <div className="space-y-24 md:space-y-36 pb-24 md:pb-32">
        <ScrollReveal>
          <DemoPageHero
            title="Pest Leads Are Urgent."
            highlight="Your Response"
            subTitle="Needs to Be Even Faster."
            description="A homeowner finding roaches at 9pm books the first company that replies — not the best one. AutomEdge responds in under 60 seconds, identifies the pest, and books the treatment. See it live below."
            tags={[
              "Residential and commercial",
              "Handles any pest type",
              "Real SMS to your phone in 60 seconds",
            ]}
          />
        </ScrollReveal>

        <ScrollReveal>
          <DemoFullSystem steps={STEPS} />
        </ScrollReveal>

        <ScrollReveal>
          <div id="roi">
            <RoiCalculator
              defaultLeads={60}
              minLeads={10}
              maxLeads={300}
              defaultTicketValue={280}
              minTicketValue={100}
              maxTicketValue={1500}
              defaultCloseRate={30}
              minCloseRate={5}
              maxCloseRate={70}
              customSubResult="Plus quarterly plan LTV multiplier"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <FAQSection faqs={FAQS} />
        </ScrollReveal>

        <ScrollReveal>
          <DemoPageCalendar
            title="Ready to respond to every pest lead in 60 seconds?"
            highlight="You need 15 minutes."
            description="We'll show you the conversation flow for your most common pests, how emergency routing works, and what the quarterly plan upsell sequence looks like."
            type="pest_control"
            tags={[
              "Residential and commercial",
              "Handles any pest type",
              "Real SMS to your phone in 60 seconds",
              "No commitment",
              "See live build",
              "14-day setup if you proceed",
            ]}
          />
        </ScrollReveal>
      </div>

      <DemoPageFooter />

      <ChatbotWrapper vertical="pest_control" />
    </main>
  );
}
