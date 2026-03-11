import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-background"></div>
        </div>
        <span className="font-outfit font-[800] text-xl tracking-tighter">
          AUTOMEDGE
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 font-sans font-black tracking-[0.25em]">
        <Link
          href="#problem"
          className="hover:text-accent transition-colors py-4"
        >
          The Problem
        </Link>
        <Link
          href="#solution"
          className="hover:text-accent transition-colors py-4"
        >
          The Solution
        </Link>
        <Link
          href="#impact"
          className="hover:text-accent transition-colors py-4"
        >
          Impact
        </Link>
        <Link href="#faq" className="hover:text-accent transition-colors py-4">
          Frequently Asked Questions
        </Link>
        <Link
          href="#contact"
          className="hover:text-accent transition-colors py-4"
        >
          Contact Us
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://wa.me/9830561158"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors text-[10px] font-sans font-black"
        >
          <MessageCircle />
          WhatsApp Us
        </a>
        <Link href="#contact">
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-[10px] font-sans font-black hover:opacity-90 transition-opacity tracking-widest">
            Get a Free Demo
          </button>
        </Link>
      </div>
    </nav>
  );
}
