import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/large-name-footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Privacy Policy | Automedge",
  description:
    "Automedge Privacy Policy. Learn how we collect, use, and protect your data.",
  openGraph: {
    title: "Privacy Policy — AutomEdge",
    description: "Learn how we collect, use, and protect your data.",
    type: "website",
    url: "https://automedgeai.com/privacy-policy",
  },
  alternates: {
    canonical: "https://automedgeai.com/privacy-policy",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy — AutomEdge",
  description: "Automedge Privacy Policy for data collection and protection.",
  url: "https://automedgeai.com/privacy-policy",
};

export default function PrivacyPolicyPage() {
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
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] opacity-30" />
      </div>

      <div className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full relative z-10">
        <ScrollReveal direction="down">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-4">
              Privacy <span className="text-accent underline decoration-8 underline-offset-8">Policy</span>
            </h1>
            <p className="text-muted-foreground font-sans font-black uppercase tracking-widest text-sm opacity-60">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-muted-foreground bg-card/40 backdrop-blur-2xl border-2 border-border/50 p-8 md:p-14 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black font-outfit text-foreground mt-0 mb-6 tracking-tight">
              1. Introduction
            </h2>
            <p className="font-medium leading-relaxed">
              Welcome to Automedge (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
              protecting your personal information and your right to privacy. If
              you have any questions or concerns about this privacy notice or our
              practices with regard to your personal information, please contact
              us at{" "}
              <a
                href="mailto:privacy@automedge.com"
                className="text-accent font-black hover:underline"
              >
                privacy@automedge.com
              </a>
              .
            </p>
            <p className="font-medium leading-relaxed">
              When you visit our website https://automedge.com (the &quot;Website&quot;),
              and more generally, use any of our services (the &quot;Services&quot;, which
              include the Website), we appreciate that you are trusting us with
              your personal information. We take your privacy very seriously. In
              this privacy notice, we seek to explain to you in the clearest way
              possible what information we collect, how we use it, and what rights
              you have in relation to it.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              2. Information We Collect
            </h2>
            <p className="font-medium leading-relaxed">
              We collect personal information that you voluntarily provide to us
              when you register on the Website, express an interest in obtaining
              information about us or our products and Services, when you
              participate in activities on the Website, or otherwise when you
              contact us.
            </p>
            <ul className="list-disc pl-6 space-y-4 mt-6 text-foreground/80 font-medium">
              <li>
                <strong className="text-foreground font-black">Personal Information Provided by You.</strong> We collect
                names; phone numbers; email addresses; job titles; contact
                preferences; billing addresses; and other similar information.
              </li>
              <li>
                <strong className="text-foreground font-black">Information automatically collected.</strong> We
                automatically collect certain information when you visit, use, or
                navigate the Website. This information does not reveal your
                specific identity (like your name or contact information) but may
                include device and usage information, such as your IP address,
                browser and device characteristics, operating system, language
                preferences, referring URLs, device name, country, location,
                information about how and when you use our Website, and other
                technical information.
              </li>
            </ul>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              3. Use of Information
            </h2>
            <p className="font-medium leading-relaxed">
              We use personal information collected via our Website for a variety
              of business purposes described below. We process your personal
              information for these purposes in reliance on our legitimate
              business interests, in order to enter into or perform a contract
              with you, with your consent, and/or for compliance with our legal
              obligations.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-6 text-foreground/80 font-medium">
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials.</li>
              <li>Request feedback.</li>
              <li>To manage user accounts.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
            </ul>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              4. Data Sharing and Disclosure
            </h2>
            <p className="font-medium leading-relaxed">
              We may process or share your data that we hold based on the
              following legal basis:
            </p>
            <ul className="list-disc pl-6 space-y-4 mt-6 text-foreground/80 font-medium">
              <li>
                <strong className="text-foreground font-black">Consent:</strong> We may process your data if you have
                given us specific consent to use your personal information for a
                specific purpose.
              </li>
              <li>
                <strong className="text-foreground font-black">Legitimate Interests:</strong> We may process your data
                when it is reasonably necessary to achieve our legitimate business
                interests.
              </li>
              <li>
                <strong className="text-foreground font-black">Performance of a Contract:</strong> Where we have entered
                into a contract with you, we may process your personal information
                to fulfill the terms of our contract.
              </li>
              <li>
                <strong className="text-foreground font-black">Legal Obligations:</strong> We may disclose your
                information where we are legally required to do so in order to
                comply with applicable law, governmental requests, a judicial
                proceeding, court order, or legal process.
              </li>
            </ul>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              5. Data Retention
            </h2>
            <p className="font-medium leading-relaxed">
              We will only keep your personal information for as long as it is
              necessary for the purposes set out in this privacy notice, unless a
              longer retention period is required or permitted by law (such as
              tax, accounting, or other legal requirements).
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              6. Your Privacy Rights
            </h2>
            <p className="font-medium leading-relaxed">
              In some regions (like the EEA, UK, and CCPA), you have certain
              rights under applicable data protection laws. These may include the
              right (i) to request access and obtain a copy of your personal
              information, (ii) to request rectification or erasure; (iii) to
              restrict the processing of your personal information; and (iv) if
              applicable, to data portability.
            </p>

            <h2 className="text-3xl font-black font-outfit text-foreground mt-12 mb-6 tracking-tight">
              7. Updates to this Policy
            </h2>
            <p className="font-medium leading-relaxed">
              We may update this privacy notice from time to time. The updated
              version will be indicated by an updated &quot;Revised&quot; date and the
              updated version will be effective as soon as it is accessible. We
              encourage you to review this privacy notice frequently to be
              informed of how we are protecting your information.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <Footer />
    </main>
  );
}

