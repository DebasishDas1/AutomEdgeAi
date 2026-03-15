import Link from "next/link";
import Image from "next/image";

const links = [
  {
    title: "Privacy",
    href: "/privacy",
  },
  {
    title: "Terms",
    href: "/terms",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const DemoPageFooter = () => {
  return (
    <footer className="w-full bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center w-[140px] h-[40px]"
        >
          <Image
            src="/AutomEdge-logo-light.png"
            alt="AutomEdge logo"
            fill
            sizes="140px"
            priority
            className="object-contain dark:hidden select-none pointer-events-none"
          />

          <Image
            src="/AutomEdge-logo.png"
            alt="AutomEdge logo"
            fill
            sizes="140px"
            priority
            className="object-contain hidden dark:block select-none pointer-events-none"
          />
        </Link>

        {/* Copyright */}
        <p className="text-sm dark:text-gray-400 text-center">
          © {new Date().getFullYear()} AutomEdge. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hover:text-foreground transition-colors flex items-center"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
