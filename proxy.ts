import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/sites', '/notifications', '/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('melly-session')?.value

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // NOTE: We do NOT redirect from /login or /register even if a cookie exists.
  // The cookie may be stale/expired — only the server-side requireUser() can
  // validate it against the DB. Forcing a redirect here breaks sign-in after logout.

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|public).*)',
  ],
}
