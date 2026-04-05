"use client";

import { m as motion } from "framer-motion";
import {
  Send,
  MessageCircle,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  X,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { createBooking } from "@/lib/api/booking";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    business: "",
    vertical: "",
    teamSize: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      await createBooking({
        name: formData.name,
        email: formData.email,
        business: formData.business,
        vertical: formData.vertical,
        team_size: formData.teamSize,
        message: formData.message,
        scheduled_at: null, // General contact inquiry
      });
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        business: "",
        vertical: "",
        teamSize: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission failed:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 md:py-32 px-6 max-w-7xl mx-auto scroll-mt-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-12 text-center lg:text-left"
        >
          <div className="flex flex-col items-center lg:items-start">
            <h2 className="text-5xl md:text-7xl font-outfit font-extrabold mb-6 tracking-tighter leading-none text-foreground">
              Let's talk scale.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-sans font-medium tracking-tight max-w-xl">
              Ready to automate your inquiries? Fill out the form and our team
              will get back to you within 60 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                aria-label="Full Name"
                className="w-full px-8 py-5 rounded-4xl bg-card border-2 border-border focus:border-accent outline-none transition-all font-sans font-semibold text-lg"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Work Email"
                aria-label="Work Email"
                className="w-full px-8 py-5 rounded-4xl bg-card border-2 border-border focus:border-accent outline-none transition-all font-sans font-semibold text-lg"
                required
                disabled={isSubmitting}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Business / Company Name"
                aria-label="Company Name"
                className="w-full px-8 py-5 rounded-4xl bg-card border-2 border-border focus:border-accent outline-none transition-all font-sans font-semibold text-lg"
                required
                disabled={isSubmitting}
                value={formData.business}
                onChange={(e) =>
                  setFormData({ ...formData, business: e.target.value })
                }
              />
              <select
                aria-label="Industry"
                className="w-full px-8 py-5 rounded-4xl bg-card border-2 border-border focus:border-accent outline-none transition-all font-sans font-semibold text-lg appearance-none cursor-pointer"
                required
                disabled={isSubmitting}
                value={formData.vertical}
                onChange={(e) =>
                  setFormData({ ...formData, vertical: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Industry
                </option>
                <option value="hvac">HVAC</option>
                <option value="roofing">Roofing</option>
                <option value="plumbing">Plumbing</option>
                <option value="pest_control">Pest Control</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                aria-label="Team Size"
                className="w-full px-8 py-5 rounded-4xl bg-card border-2 border-border focus:border-accent outline-none transition-all font-sans font-semibold text-lg appearance-none cursor-pointer"
                disabled={isSubmitting}
                value={formData.teamSize}
                onChange={(e) =>
                  setFormData({ ...formData, teamSize: e.target.value })
                }
              >
                <option value="" disabled>
                  Company Team Size
                </option>
                <option value="1-5">1-5 Employees</option>
                <option value="6-20">6-20 Employees</option>
                <option value="21-50">21-50 Employees</option>
                <option value="50+">50+ Employees</option>
              </select>
              <div className="flex items-center px-4 md:px-8 text-muted-foreground italic text-sm md:text-base opacity-60">
                Wait times are currently under 10 minutes.
              </div>
            </div>

            <textarea
              placeholder="How can we help?"
              aria-label="Your Message"
              rows={4}
              className="w-full px-8 py-5 rounded-4xl bg-card border-border border-2 focus:border-accent outline-none transition-all font-sans font-semibold text-lg resize-none"
              required
              disabled={isSubmitting}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>

            <div className="flex flex-col gap-4">
              <div className="flex justify-center lg:justify-start">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-12 py-5 bg-primary text-primary-foreground rounded-full font-sans font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 group shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-accent font-bold text-lg text-center lg:text-left"
                >
                  ✓ Successfully sent. We'll be in touch!
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive font-bold text-lg text-center lg:text-left"
                >
                  ✗ Failed to send. Please try again or email us directly.
                </motion.p>
              )}
            </div>
          </form>
        </motion.div>

        {/* Right: Direct Contact & Socials */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-16 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <div className="space-y-8 w-full">
            <h3 className="text-xl font-outfit font-black tracking-[0.3em] uppercase opacity-40">
              Direct Contact
            </h3>
            <div className="space-y-6">
              <a
                href="https://wa.me/9830561158"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] border-2 border-border hover:border-accent/40 bg-card hover:bg-accent/5 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110 transition-all duration-300 shadow-inner [&_svg]:w-10 [&_svg]:h-10">
                  <MessageCircle />
                </div>
                <div>
                  <div className="font-outfit font-extrabold text-2xl tracking-tight">
                    WhatsApp Us
                  </div>
                  <div className="text-lg text-muted-foreground font-sans font-medium leading-tight">
                    Instant support for urgent inquiries.
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden sm:block" />
              </a>

              <a
                href="mailto:hello@automedge.com"
                className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] border-2 border-border hover:border-primary/40 bg-card hover:bg-primary/5 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-inner [&_svg]:w-10 [&_svg]:h-10">
                  <Mail />
                </div>
                <div>
                  <div className="font-outfit font-extrabold text-2xl tracking-tight">
                    Email Us
                  </div>
                  <div className="text-lg text-muted-foreground font-sans font-medium tracking-tight">
                    hello@automedge.com
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden sm:block" />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-outfit font-black tracking-[0.3em] uppercase opacity-40">
              Follow Us
            </h3>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              {[
                { icon: <X />, href: "#", label: "Twitter" },
                { icon: <Linkedin />, href: "#", label: "LinkedIn" },
                { icon: <Facebook />, href: "#", label: "Facebook" },
                { icon: <Instagram />, href: "#", label: "Instagram" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-20 h-20 rounded-3xl border-2 border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all text-muted-foreground shadow-sm hover:shadow-xl [&_svg]:w-8 [&_svg]:h-8"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
