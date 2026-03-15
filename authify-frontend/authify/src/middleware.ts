import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const hostname = request.nextUrl.hostname;
    const protocol = request.nextUrl.protocol;

    // Force http for local development to avoid mixed-content issues
    if (protocol === 'https:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      const url = request.nextUrl.clone();
      url.protocol = 'http:';
      return NextResponse.redirect(url);
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin') {
      // Check if user is authenticated and has admin role
      const token = request.cookies.get('accessToken')?.value;
      
      if (!token) {
        // Redirect to admin login if no token
        const loginUrl = new URL('/admin-login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // For now, we'll check token on the client side
      // In production, you'd want to verify the token and check user role here
      // This is a simplified version that relies on client-side checks
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // Check if user is authenticated
      const token = request.cookies.get('accessToken')?.value;
      
      if (!token) {
        // Redirect to user login if no token
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  } catch {
    // Never block requests due to middleware errors
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
