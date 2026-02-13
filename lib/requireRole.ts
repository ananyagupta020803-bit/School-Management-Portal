import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { UserRole } from './roles';

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session || !allowedRoles.includes(session.user.role as UserRole)) {
    redirect('/unauthorized');
  }

  return session;
}
