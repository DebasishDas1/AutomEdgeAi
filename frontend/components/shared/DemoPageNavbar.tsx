import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const DemoPageNavbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center w-[140px] h-[40px]"
        >
          {/* Light Mode Logo */}
          <Image
            src="/AutomEdge-logo-light.png"
            alt="AutomEdge logo"
            fill
            sizes="140px"
            priority
            className="object-contain dark:hidden select-none pointer-events-none"
          />

          {/* Dark Mode Logo */}
          <Image
            src="/AutomEdge-logo.png"
            alt="AutomEdge logo"
            fill
            sizes="140px"
            priority
            className="object-contain hidden dark:block select-none pointer-events-none"
          />
        </Link>

        {/* CTA */}
        <Link href="#demo">
          <Button className="bg-cta px-4 py-2 rounded-full font-semibold">
            Get a Free Demo
          </Button>
        </Link>
      </div>
    </nav>
  );
};
