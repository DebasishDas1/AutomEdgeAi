import Link from "next/link";
import Image from "next/image";

const links = [
  { title: "Privacy", href: "/privacy" },
  { title: "Terms", href: "/terms" },
  { title: "Contact", href: "/contact" },
];

export const DemoPageFooter = () => {
  return (
    <footer className="relative w-full bg-background/60 backdrop-blur-2xl">
      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="relative flex h-[36px] w-[130px] items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/AutomEdge-logo-light.png"
              alt="AutomEdge logo"
              fill
              sizes="130px"
              priority
              className="object-contain dark:hidden select-none pointer-events-none"
            />
            <Image
              src="/AutomEdge-logo.png"
              alt="AutomEdge logo"
              fill
              sizes="130px"
              priority
              className="object-contain hidden dark:block select-none pointer-events-none"
            />
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="relative transition-all duration-300 hover:text-foreground flex items-center"
              >
                {link.title}

                {/* premium underline animation */}
                <span className="absolute left-0 -bottom-1 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} AutomEdge. Crafted with precision.
          </p>
        </div>
      </div>
    </footer>
  );
};
