import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/roles';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as UserRole;

    if (pathname.startsWith('/admin') && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (
      pathname.startsWith('/teacher') &&
      ![UserRole.ADMIN, UserRole.TEACHER].includes(role)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (
      pathname.startsWith('/student') &&
      ![UserRole.ADMIN, UserRole.STUDENT].includes(role)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
