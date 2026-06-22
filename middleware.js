import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge"
import { NextResponse } from "next/server"

const PUBLIC_PREFIXES = ["/paqueterita", "/control-vehicular", "/flotilla", "/qa"]

const authMiddleware = withMiddlewareAuthRequired()

export default async function middleware (req) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isPublic) {
    return NextResponse.next()
  }

  return authMiddleware(req)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
