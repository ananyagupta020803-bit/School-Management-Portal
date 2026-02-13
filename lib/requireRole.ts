import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/roles';

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    redirect('/unauthorized');
  }

  return session;
}
