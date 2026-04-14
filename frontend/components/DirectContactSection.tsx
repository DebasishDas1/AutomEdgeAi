import { Mail, MessageCircle } from "lucide-react";

type DirectContactSectionProp = {
  whatsappNumber: string;
  email: string;
};

export function DirectContactSection({
  whatsappNumber,
  email,
}: DirectContactSectionProp) {
  return (
    <section id="direct-contact" className="px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-outfit tracking-tight leading-tight mb-10 text-foreground">
          Direct Contact
        </h2>

        {/* Cards Wrapper */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Hi, I want to see the clinic automation demo",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-6 w-full md:w-105 rounded-[28px] border border-white/10 bg-card backdrop-blur-xl p-6 md:p-8 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)]"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 shrink-0">
              <MessageCircle className="w-7 h-7 text-emerald-400" />
            </div>

            {/* Text */}
            <div className="text-left">
              <div className="text-lg md:text-2xl font-medium text-primary">
                WhatsApp Us
              </div>
              <div className="text-slate-400 text-sm md:text-base mt-1">
                Instant support for urgent inquiries.
              </div>
            </div>
          </a>

          {/* Email Card */}
          <a
            href={`mailto:${email}`}
            className="group flex items-center gap-6 w-full md:w-105 rounded-[28px] border border-white/10 bg-card backdrop-blur-xl p-6 md:p-8 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(255,255,255,0.08)]"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 shrink-0">
              <Mail className="w-7 h-7 text-red-400" />
            </div>

            {/* Text */}
            <div className="text-left">
              <div className="text-lg md:text-2xl font-medium text-primary">
                Email Us
              </div>
              <div className="text-slate-400 text-sm md:text-base mt-1">
                {email}
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
