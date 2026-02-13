import { withAuth } from 'next-auth/middleware';
import { UserRole } from './lib/roles';

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (!token) return false;

        if (pathname.startsWith('/admin')) {
          return token.role === UserRole.ADMIN;
        }

        if (pathname.startsWith('/teacher')) {
          return token.role === UserRole.TEACHER;
        }

        if (pathname.startsWith('/student')) {
          return token.role === UserRole.STUDENT;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
