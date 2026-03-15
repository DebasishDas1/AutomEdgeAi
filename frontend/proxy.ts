import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  const hostname = host.split(":")[0];

  let subdomain = "";

  // Local development support
  if (hostname.endsWith(".localhost")) {
    subdomain = hostname.replace(".localhost", "");
  }

  // Production domain support
  else if (hostname.split(".").length > 2) {
    subdomain = hostname.split(".")[0];
  }

  // Ignore main domains
  if (
    hostname === "localhost" ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("192.168") ||
    subdomain === "" ||
    subdomain === "www"
  ) {
    return NextResponse.next();
  }

  // Rewrite to subdomain folder
  url.pathname = `/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
