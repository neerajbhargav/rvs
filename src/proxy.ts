import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('supportiq_session');
  
  const isAuthPage = request.nextUrl.pathname === '/';
  
  // Protect all non-api routes except the root auth page
  if (!session && !isAuthPage && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect logged in users away from the auth page to the dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
