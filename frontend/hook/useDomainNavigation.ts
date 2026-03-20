const isLocalhost = (host: string) =>
  host.includes("localhost") || host.includes("127.0.0.1");


export const getDomainUrl = (subdomain?: string) => {
  if (typeof window === "undefined") return "/";

  const protocol = window.location.protocol; // auto http/https
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  if (!root) return "/";

  // Local dev → use path instead of subdomain
  if (isLocalhost(window.location.hostname)) {
    if (!subdomain) return `${protocol}//${root}`;
    return `${protocol}//${root}/${subdomain}`;
  }

  // Production → real subdomains
  if (!subdomain) return `${protocol}//${root}`;
  return `${protocol}//${subdomain}.${root}`;
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



export const useDomainNavigation = () => {
  const goTo = (subdomain?: string) => {
    const target = getDomainUrl(subdomain);

    if (!target) return;

    // Avoid unnecessary reload
    if (window.location.href === target) return;

    window.location.assign(target); // better than href
  };

  const goToDemo = (industry: string) => {
    goTo(`demo-${industry}`);
  };

  const goHome = () => {
    goTo();
  };

  const getCurrentDomain = () => {
    return getCurrentSubdomain();
  };

  return { goTo, goToDemo, goHome, getCurrentDomain };
};