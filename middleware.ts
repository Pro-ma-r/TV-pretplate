import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // ⛔ NEMA SUPABASE
  // ⛔ NEMA COOKIES
  // ⛔ NEMA AUTH LOGIKE
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
