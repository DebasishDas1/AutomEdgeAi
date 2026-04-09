import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/large-name-footer";

export const metadata: Metadata = {
  title: "Terms of Service | Automedge",
  description:
    "Automedge Terms of Service. Please read these terms carefully before using our services.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "March 15, 2026";

  return (
    <main className="min-h-screen relative flex flex-col bg-background selection:bg-accent/30">
      <Navbar />

      <div className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full relative z-10">
        {/* Premium Background Blobs */}
        <div className="absolute top-0 right-1/4 w-125 h-125 bg-accent/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-100 h-100 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground font-sans font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-muted-foreground bg-card/40 backdrop-blur-2xl border border-border p-8 md:p-14 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing our website at automedge.com (the &quot;Site&quot;) or using any
            of our services, you agree to be bound by these Terms of Service. If
            you do not agree with any part of these terms, you may not access
            our services.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            2. Description of Service
          </h2>
          <p>
            Automedge provides artificial intelligence lead automation,
            scheduling, and communication software for service-based businesses
            (the &quot;Service&quot;). We reserve the right to modify, suspend, or
            discontinue the Service (in whole or in part) at any time, with or
            without notice.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            3. Accounts and Registration
          </h2>
          <p>
            To use certain features of the Service, you must register for an
            account. You agree to provide accurate, current, and complete
            information during the registration process and to update such
            information to keep it accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to
            access the Service and for any activities or actions under your
            password. You agree to notify us immediately of any unauthorized use
            of your account.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            4. Acceptable Use and Messaging Rules
          </h2>
          <p>You agree not to use the Service:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              In any way that violates any applicable federal, state, local, or
              international law or regulation (including TCPA and standard SMS
              compliance rules, such as 10DLC).
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
              the site or interfere with any other party&apos;s use of the Service.
            </li>
          </ul>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            5. Intellectual Property Rights
          </h2>
          <p>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of Automedge and its
            licensors. The Service is protected by copyright, trademark, and
            other laws of both the United States and foreign countries. Our
            trademarks and trade dress may not be used in connection with any
            product or service without the prior written consent of Automedge.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            6. Payment and Subscription
          </h2>
          <p>
            Some parts of the Service are billed on a subscription basis. You
            will be billed in advance on a recurring and periodic basis (such as
            monthly or annually), depending on the type of subscription plan you
            select.
          </p>
          <p>
            At the end of each billing cycle, your subscription will
            automatically renew under the exact same conditions unless you
            cancel it or we cancel it. You may cancel your subscription renewal
            either through your online account management page or by contacting
            our customer support team.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            7. Limitation of Liability
          </h2>
          <p>
            In no event shall Automedge, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from (i) your access to or use of or
            inability to access or use the Service; (ii) any conduct or content
            of any third party on the Service; (iii) any content obtained from
            the Service; and (iv) unauthorized access, use or alteration of your
            transmissions or content, whether based on warranty, contract, tort
            (including negligence) or any other legal theory.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            8. Governing Law
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of the United States, without regard to its conflict of law
            provisions.
          </p>

          <h2 className="text-3xl font-bold font-outfit text-foreground mt-12 mb-6">
            9. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            Email:{" "}
            <a
              href="mailto:legal@automedge.com"
              className="text-accent hover:underline"
            >
              legal@automedge.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
