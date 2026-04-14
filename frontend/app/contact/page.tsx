import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/large-name-footer";
import { Mail, LifeBuoy, Send } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact the Automedge Team | Support & Sales for Service Automation",
  description:
    "Get in touch with the Automedge team. We're here to help HVAC, Roofing, and Plumbing businesses automate their leads and bookings.",
  openGraph: {
    title: "Contact AutomEdge",
    description: "Get in touch with our team for support or sales inquiries.",
    type: "website",
    url: "https://automedgeai.com/contact",
  },
  alternates: {
    canonical: "https://automedgeai.com/contact",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact AutomEdge",
  description: "Contact our team for support or sales inquiries.",
  url: "https://automedgeai.com/contact",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen relative flex flex-col bg-background selection:bg-accent/30 overflow-x-hidden">
      {/* 🔹 Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🔹 Premium Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      <Navbar />

      <div className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-6">
              Contact{" "}
              <span className="text-accent underline decoration-8 underline-offset-8">
                Us
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-medium opacity-90">
              Have a question about Automedge, need help with your account, or
              just want to chat about AI automation? We&apos;d love to hear from
              you.
            </p>
          </div>
        </ScrollReveal>

        <div className="prose prose-lg dark:prose-invert max-w-none font-sans relative z-20">
          <div className="grid sm:grid-cols-2 gap-8 mb-20">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="p-10 h-full rounded-[2.5rem] border-2 border-border/50 bg-card/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 text-accent group-hover:scale-110 transition-transform ring-4 ring-accent/5">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-outfit mb-4 text-foreground tracking-tight">
                  Talk to Sales
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed font-medium">
                  Interested in how Automedge can scale your business?
                </p>
                <a
                  href="mailto:hello@automedge.com"
                  className="inline-flex items-center gap-2 text-accent font-black hover:gap-3 transition-all text-lg group/link"
                >
                  Email Sales Team
                  <span className="text-xl group-hover/link:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.3}>
              <div className="p-10 h-full rounded-[2.5rem] border-2 border-border/50 bg-card/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform ring-4 ring-primary/5">
                  <LifeBuoy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-outfit mb-4 text-foreground tracking-tight">
                  Support
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed font-medium">
                  Need technical assistance with your current system?
                </p>
                <a
                  href="mailto:support@automedge.com"
                  className="inline-flex items-center gap-2 text-primary font-black hover:gap-3 transition-all text-lg group/link"
                >
                  Email Technical Support
                  <span className="text-xl group-hover/link:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="max-w-2xl mx-auto border-t border-border pt-20">
              <h2 className="text-3xl md:text-4xl font-black font-outfit mb-10 text-foreground text-center tracking-tight">
                Send a Message
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 pl-4 block"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-6 py-5 rounded-full bg-card/60 border-2 border-border/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all font-sans font-bold shadow-inner"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 pl-4 block"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-6 py-5 rounded-full bg-card/60 border-2 border-border/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all font-sans font-bold shadow-inner"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 pl-4 block"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-6 py-5 rounded-4xl bg-card/60 border-2 border-border/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all font-sans font-bold shadow-inner resize-none"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="flex justify-center pt-8">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-12 py-5 bg-foreground text-background rounded-full font-sans font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group shadow-2xl relative overflow-hidden"
                  >
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <Footer />
    </main>
  );
}
