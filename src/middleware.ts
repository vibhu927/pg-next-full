import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute = path.startsWith("/dashboard") ||
                          path.startsWith("/properties") ||
                          path.startsWith("/rooms") ||
                          path.startsWith("/tenants") ||
                          path.startsWith("/settings");

  // Define auth routes
  const isAuthRoute = path === "/" || path === "/login" || path === "/register";

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/properties/:path*",
    "/rooms/:path*",
    "/tenants/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
