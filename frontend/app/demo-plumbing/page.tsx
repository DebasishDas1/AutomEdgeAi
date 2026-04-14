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
  title:
    "See AI Handle Plumbing Emergencies Automatically — Live Demo | AutomEdge",
  description:
    "Plumbing emergencies wait for no one. See how AutomEdge responds instantly, diagnoses the issue, and books the job automatically. Try the live demo — real SMS in under 60 seconds.",
  openGraph: {
    title: "Live Plumbing Demo — AutomEdge",
    description:
      "Plumbing emergencies wait for no one. See how AutomEdge responds instantly, diagnoses the issue, and books the job automatically.",
    images: ["/plumbing.png"],
    type: "website",
    url: "https://automedgeai.com/demo-plumbing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Plumbing Demo — AutomEdge",
    description:
      "Plumbing emergencies wait for no one. See how AutomEdge responds instantly, diagnoses the issue, and books the job automatically.",
    images: ["/plumbing.png"],
  },
  alternates: {
    canonical: "https://automedgeai.com/demo-plumbing",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Live Plumbing Demo — AutomEdge",
  description: "Watch AI book plumbing jobs automatically in real time.",
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
    question: "How does it handle real emergencies after hours?",
    answer:
      "Emergency leads immediately send an SMS alert to your on-call tech with the customer's contact info and issue. The customer gets a response in under 60 seconds and an ETA. You define what counts as emergency — we build the routing rule.",
  },
  {
    question:
      "Does it give first-aid instructions to prevent damage escalating?",
    answer:
      "Yes — this is one of the most valuable features. When a customer reports an active leak, the AI sends the appropriate shutoff instruction while your tech is dispatched. Prevents small leaks becoming flood damage.",
  },
  {
    question: "Does it work with ServiceTitan / Housecall Pro / Jobber?",
    answer:
      "Yes — we integrate directly with all three. Jobs booked through AutomEdge appear in your dispatch queue automatically.",
  },
  {
    question: "We're a 2-person operation — is this worth it?",
    answer:
      "Especially for small teams. When you're both on jobs, every missed call is a lost job. This system meansyour phone never goes unanswered. Most 2-person plumbing businesses see ROI from week one.",
  },
  {
    question: "Can it handle multiple service areas?",
    answer:
      "Yes. Leads from different zip codes route to different tech calendars. If you have separate crews by territory, we build that routing in.",
  },
  {
    question: "Contract?",
    answer: "Month-to-month. No cancellation fees. Ever.",
  },
];

const STEPS = [
  {
    title: "Instant Response + Emergency Triage",
    description:
      "Plumbing leads are the most time-sensitive. A burst pipe at 10pm? The homeowner texts the first company that replies — not the best one. AutomEdge responds in under 60 seconds, diagnoses the issue, and books the job.",
    message:
      "Hi, Tom from Sunbelt Shield here. Got your message — we'll get this sorted fast. Are you seeing the pests themselves or just signs?",
    smallWin: "First response wins 70%+ of emergency plumbing jobs.",
  },
  {
    title: "3-Tier Urgency Routing",
    description:
      "Not all plumbing leads are equal. A dripping tap is not a burst pipe. AutomEdge tags every lead as Routine, Active, or Emergency and routes them to the right tech calendar. Emergency leads trigger instant SMS alerts to your on-call tech.",
    message:
      "Got it. And is this in just the kitchen, or other rooms too? Helps us bring the right treatment.",
    smallWin:
      "Treating a burst pipe the same as a dripping tap loses emergency jobs every time.",
  },
  {
    title: "First-Aid Instructions",
    description:
      "When a customer reports an active leak, the AI sends the appropriate shutoff instruction while your tech is dispatched. Prevents small leaks becoming flood damage.",
    message:
      "We can be there today at 4pm or tomorrow at 9am. Here's your slot: [link]. Takes 30 seconds.",
    smallWin:
      "Prepared customers = effective first treatments = 5-star reviews.",
  },
  {
    title: "Smart Booking",
    description:
      "Customers book in 30 seconds — not 30 minutes. The system syncs with your Google Calendar, blocks the time, and sends an automated confirmation. No double bookings. No confusion.",
    message:
      "We can be there today at 4pm or tomorrow at 9am. Here's your slot: [link]. Takes 30 seconds.",
    smallWin: "Customers book when they're ready — not when your tech answers.",
  },
  {
    title: "Pre-Job Prep Instructions",
    description:
      "The night before the appointment, the system sends clear prep instructions — clear under sinks, store pet food. Reduces failed treatments and return visits.",
    message:
      "Reminder: Tomorrow 9–11am. For best results: clear under your kitchen sink and store pet food in sealed containers tonight.",
    smallWin:
      "Prepared customers = effective first treatments = 5-star reviews.",
  },
  {
    title: "Post-Job Follow-Up",
    description:
      "After the job, the system sends a text asking if everything's still good. If the customer replies with any issue, it gets flagged instantly. If not, it asks for a review 24 hours later.",
    message:
      "Hey, Tom from Sunbelt Shield here. Just checking in — how's the drain holding up?",
    smallWin:
      "Most plumbing businesses never follow up. That's why 40% of customers go to competitors next time.",
  },
  {
    title: "Review Generation",
    description: "2 hours post-treatment, automated Google review request.",
    message:
      "Hope your drain's running smooth! 🙏 If we did a great job, a quick Google review helps us a lot: [link]",
    smallWin: "More reviews = Google ranks you higher = free leads.",
  },
];

const navItems = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Roi Calculator", href: "#roi" },
  { label: "Faq", href: "#faq" },
];

export default function PlumbingPage() {
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
        <CallAgent type={"plumbing"} />
      </ScrollReveal>

      <div className="space-y-24 md:space-y-36 pb-24 md:pb-32">
        <ScrollReveal>
          <DemoPageHero
            title="A Burst Pipe at 11pm"
            highlight="Won't Wait."
            subTitle="Neither Should Your Response."
            description="A burst pipe or backed-up toilet at 10pm? The homeowner texts the first company that replies — not the best one. AutomEdge responds in under 60 seconds, diagnoses the issue, and books the job. See it live below."
            tags={[
              "24/7 instant response",
              "Handles any plumbing emergency",
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
              defaultLeads={50}
              minLeads={10}
              maxLeads={250}
              defaultTicketValue={650}
              minTicketValue={150}
              maxTicketValue={5000}
              defaultCloseRate={35}
              minCloseRate={5}
              maxCloseRate={70}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <FAQSection faqs={FAQS} />
        </ScrollReveal>

        <ScrollReveal>
          <DemoPageCalendar
            title="Stop losing emergency calls to voicemail."
            highlight="We'll show you how it works live."
            description="We'll show you the conversation flow for your most common plumbing issues, how emergency routing works, and what the post-job follow-up sequence looks like."
            type="plumbing"
            tags={["No commitment", "Live custom walkthrough", "14-day setup"]}
          />
        </ScrollReveal>
      </div>

      <DemoPageFooter />

      <ChatbotWrapper vertical="plumbing" />
    </main>
  );
}
