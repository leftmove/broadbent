import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { middleware as supertokensMiddleware } from "supertokens-node/framework/express";
import { ensureSuperTokensInit } from "lib/supertokens/backend";

ensureSuperTokensInit();

export async function middleware(request: NextRequest) {
  // Handle SuperTokens auth routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Handle auth page routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // For all other routes, check if user is authenticated
  const sessionCookie = request.cookies.get("sAccessToken");
  
  if (!sessionCookie && !request.nextUrl.pathname.startsWith("/auth")) {
    // Redirect to auth page if not authenticated
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};