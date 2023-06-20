import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("currentUser")?.value;

  if (request.nextUrl.pathname === '/auth' && currentUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}