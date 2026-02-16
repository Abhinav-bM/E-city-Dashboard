import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protected routes (e.g., dashboard, products, categories)
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/home-content");

  // Define auth routes
  const isAuthRoute = pathname.startsWith("/auth");

  // Get the access token from cookies
  const accessToken = request.cookies.get("adminAccessToken")?.value;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !accessToken) {
    const url = new URL("/auth/login", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from login page to dashboard
  if (isAuthRoute && accessToken) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
