import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProfileRoute = pathname.startsWith("/profile");
  const isDonationRoute = pathname.startsWith("/don");
  const requiresAuthentication = isAdminRoute || isProfileRoute || isDonationRoute;

  if (!requiresAuthentication) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", requestedPath);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.user?.role !== "admin") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", requestedPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (login page)
     * - /api/auth/* (authentication API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /sitemap.xml, /robots.txt (metadata files)
     */
    "/((?!login|api/auth|api/clover|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)",
  ],
};
