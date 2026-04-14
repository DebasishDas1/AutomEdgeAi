import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/large-name-footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Terms of Service | Automedge",
  description:
    "Automedge Terms of Service. Please read these terms carefully before using our services.",
  openGraph: {
    title: "Terms of Service — AutomEdge",
    description: "Please read our internal terms and conditions carefully.",
    type: "website",
    url: "https://automedgeai.com/tos",
  },
  alternates: {
    canonical: "https://automedgeai.com/tos",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service — AutomEdge",
  description: "Terms and conditions for using Automedge services.",
  url: "https://automedgeai.com/tos",
};

export default function TermsOfServicePage() {
  const lastUpdated = "March 15, 2026";

  return (
    <main className="min-h-screen relative flex flex-col bg-background selection:bg-accent/30 overflow-x-hidden">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] opacity-30" />
      </div>

      <div className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full relative z-10">
        <ScrollReveal direction="down">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-4">
              Terms of{" "}
              <span className="text-primary underline decoration-8 underline-offset-8">
                Service
              </span>
            </h1>
            <p className="text-muted-foreground font-sans font-black uppercase tracking-widest text-sm opacity-60">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-muted-foreground bg-card/40 backdrop-blur-2xl border-2 border-border/50 p-8 md:p-14 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black font-outfit text-foreground mt-0 mb-6 tracking-tight">
              1. Agreement to Terms
            </h2>
            <p className="font-medium leading-relaxed">
              By accessing our website at automedge.com (the &quot;Site&quot;)
              or using any of our services, you agree to be bound by these Terms
              of Service. If you do not agree with any part of these terms, you
              may not access our services.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              2. Description of Service
            </h2>
            <p className="font-medium leading-relaxed">
              Automedge provides artificial intelligence lead automation,
              scheduling, and communication software for service-based
              businesses (the &quot;Service&quot;). We reserve the right to
              modify, suspend, or discontinue the Service (in whole or in part)
              at any time, with or without notice.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              3. Accounts and Registration
            </h2>
            <p className="font-medium leading-relaxed">
              To use certain features of the Service, you must register for an
              account. You agree to provide accurate, current, and complete
              information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </p>
            <p className="font-medium leading-relaxed">
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              4. Acceptable Use and Messaging Rules
            </h2>
            <p className="leading-relaxed text-foreground/90 font-bold mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-4 text-foreground/80 font-medium">
              <li>
                In any way that violates any applicable federal, state, local,
                or international law or regulation (including TCPA and standard
                SMS compliance rules, such as 10DLC).
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or
                promotional material without the recipient&apos;s prior consent.
              </li>
              <li>
                To impersonate or attempt to impersonate Automedge, an Automedge
                employee, another user, or any other person or entity.
              </li>
              <li>
                In any manner that could disable, overburden, damage, or impair
                the site or interfere with any other party&apos;s use of the
                Service.
              </li>
            </ul>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              5. Intellectual Property Rights
            </h2>
            <p className="font-medium leading-relaxed">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Automedge and its
              licensors. The Service is protected by copyright, trademark, and
              other laws of both the United States and foreign countries. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of Automedge.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              6. Payment and Subscription
            </h2>
            <p className="font-medium leading-relaxed text-foreground/90">
              Some parts of the Service are billed on a subscription basis.
            </p>
            <p className="font-medium leading-relaxed">
              You will be billed in advance on a recurring and periodic basis
              (such as monthly or annually), depending on the type of
              subscription plan you select.
            </p>
            <p className="font-medium leading-relaxed">
              At the end of each billing cycle, your subscription will
              automatically renew under the exact same conditions unless you
              cancel it or we cancel it. You may cancel your subscription
              renewal either through your online account management page or by
              contacting our customer support team.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              7. Limitation of Liability
            </h2>
            <p className="font-medium leading-relaxed italic opacity-80">
              In no event shall Automedge, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from (i) your
              access to or use of or inability to access or use the Service;
              (ii) any conduct or content of any third party on the Service;
              (iii) any content obtained from the Service; and (iv) unauthorized
              access, use or alteration of your transmissions or content.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              8. Governing Law
            </h2>
            <p className="font-medium leading-relaxed">
              These Terms shall be governed and construed in accordance with the
              laws of the United States, without regard to its conflict of law
              provisions.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              9. Contact Us
            </h2>
            <p className="font-medium leading-relaxed">
              If you have any questions about these Terms, please contact us at:
              <br />
              <a
                href="mailto:legal@automedge.com"
                className="text-accent font-black hover:underline inline-block mt-4 text-xl"
              >
                legal@automedge.com
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>

      <Footer />
    </main>
  );
}
