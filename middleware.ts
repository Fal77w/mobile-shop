import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/login"];
const adminOnlyRoutes = ["/users", "/settings"];
const accountantRoutes = ["/purchases", "/expenses"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/logout") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!session && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (session && accountantRoutes.some((route) => pathname.startsWith(route))) {
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "ACCOUNTANT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
