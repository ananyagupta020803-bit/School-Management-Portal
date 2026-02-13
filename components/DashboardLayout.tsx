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

  const navLinks = {
    ADMIN: [{ label: 'Dashboard', href: '/admin' }],
    TEACHER: [{ label: 'Dashboard', href: '/teacher' }],
    STUDENT: [{ label: 'Dashboard', href: '/student' }],
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">School Portal</h2>

        <nav className="space-y-3">
          {navLinks[role].map((link) => (
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
