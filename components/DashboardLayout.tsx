'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { UserRole } from '@/lib/roles';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role as UserRole;

  const navLinks: Record<UserRole, { label: string; href: string }[]> = {
    [UserRole.ADMIN]: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Teachers', href: '/admin/teachers' },
      { label: 'Students', href: '/admin/students' },
    ],
    [UserRole.TEACHER]: [
      { label: 'Dashboard', href: '/teacher' },
    ],
    [UserRole.STUDENT]: [
      { label: 'Dashboard', href: '/student' },
    ],
  };

  const links = navLinks[role] || [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">School Portal</h2>

        <nav className="space-y-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                {link.label}
              </div>
            </Link>
          ))}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-10 w-full bg-red-600 hover:bg-red-700 p-2 rounded"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
}
