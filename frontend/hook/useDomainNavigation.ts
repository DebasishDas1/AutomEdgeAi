const isLocalhost = (host: string) =>
  host.includes("localhost") || host.includes("127.0.0.1");

const isValidSubdomain = (subdomain?: string) =>
  typeof subdomain === "string" &&
  subdomain.length > 0 &&
  /^[a-z0-9-]+$/.test(subdomain) &&
  !subdomain.startsWith("-") &&
  !subdomain.endsWith("-");


export const getDomainUrl = (subdomain?: string) => {
  if (typeof window === "undefined") return "/";

  const protocol = window.location.protocol; // auto http/https
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  if (!root) return "/";

  // Local dev → use path instead of subdomain
  const effectiveSubdomain = isValidSubdomain(subdomain)
    ? subdomain
    : undefined;

  if (isLocalhost(window.location.hostname)) {
    if (!effectiveSubdomain) return `${protocol}//${root}`;
    return `${protocol}//${root}/${effectiveSubdomain}`;
  }

  // Production → real subdomains
  if (!effectiveSubdomain) return `${protocol}//${root}`;
  return `${protocol}//${effectiveSubdomain}.${root}`;
};



export const getCurrentSubdomain = () => {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;

  if (isLocalhost(host)) return null;

  const parts = host.split(".");

  // ignore www
  if (parts[0] === "www") return null;

  return parts.length > 2 ? parts[0] : null;
};



import { useRouter } from "next/navigation";

export const useDomainNavigation = () => {
  const router = useRouter();

  const getTargetInfo = (subdomain?: string) => {
    if (typeof window === "undefined") return { url: "/", isExternal: false };

    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    const effectiveSubdomain = isValidSubdomain(subdomain)
      ? subdomain
      : undefined;

    if (!root) return { url: "/", isExternal: false };

    // LOCALHOST logic (dev)
    if (isLocalhost(host)) {
      const path = effectiveSubdomain ? `/${effectiveSubdomain}` : "/";
      return { url: path, isExternal: false };
    }

    // PRODUCTION logic
    const currentSubdomain = getCurrentSubdomain();

    // If already on the target subdomain, it's internal navigation
    if (currentSubdomain === (effectiveSubdomain || null)) {
      return { url: "/", isExternal: false };
    }

    // If navigating to root or another subdomain
    const url = effectiveSubdomain 
      ? `${protocol}//${effectiveSubdomain}.${root}`
      : `${protocol}//${root}`;

    return { url, isExternal: true };
  };

  const goTo = (subdomain?: string) => {
    const { url, isExternal } = getTargetInfo(subdomain);

    if (isExternal) {
      window.location.assign(url);
    } else {
      router.push(url);
    }
  };

  const goToDemo = (industry: string) => {
    const safeIndustry = industry
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "");

    if (!safeIndustry) {
      goHome();
      return;
    }

    goTo(`demo-${safeIndustry}`);
  };

  const goHome = () => {
    goTo();
  };

  const getCurrentDomain = () => {
    return getCurrentSubdomain();
  };

  return { goTo, goToDemo, goHome, getCurrentDomain };
};