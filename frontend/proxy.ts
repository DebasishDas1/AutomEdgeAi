import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const host = (await req.headers).get("host") || ""
  const url = req.nextUrl.clone()

  const hostname = host.split(":")[0]

  let subdomain = ""

  // localhost subdomain support
  if (hostname.endsWith(".localhost")) {
    subdomain = hostname.replace(".localhost", "")
  }

  // production subdomain support
  else if (hostname.endsWith("automedge.com")) {
    const parts = hostname.split(".")
    if (parts.length > 2) {
      subdomain = parts[0]
    }
  }

  // if no valid subdomain → DO NOTHING
  if (!subdomain) {
    return NextResponse.next()
  }

  // rewrite to matching folder
  url.pathname = `/${subdomain}${url.pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
