import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

// Use a separate NextAuth instance for middleware that doesn't include the full providers setup.
// This avoids importing Node-specific modules like better-sqlite3 in the Edge runtime.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  const isAdminDashboardRoute = nextUrl.pathname.startsWith('/admin/dashboard')
  const isAdminLoginRoute = nextUrl.pathname === '/admin/login'

  // 1. Strict protection for ONLY admin dashboard routes
  if (isAdminDashboardRoute) {
    if (!isLoggedIn || role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', nextUrl))
    }
  }

  // 2. Prevent logged-in admins from seeing the login page
  if (isAdminLoginRoute && isLoggedIn && role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
  }

  return NextResponse.next()
})

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
}
