import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "sss_boutique_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    let isAdmin = false;

    if (session?.value) {
      try {
        const user = JSON.parse(session.value);
        if (user && (user.role === "admin" || user.role === "superadmin" || user.role === "super_admin")) {
          isAdmin = true;
        }
      } catch {
        isAdmin = false;
      }
    }

    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to match admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
