import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect based on role
    switch (session.user.role) {
      case 'admin':
        redirect('/admin');
      case 'teacher':
        redirect('/teacher');
      case 'student':
        redirect('/student');
      default:
        redirect('/login');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            School Management Portal
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to the comprehensive school management system
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
          >
            Login
          </Link>

          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-600 text-center mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Admin:</strong> admin@school.com / admin123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Teacher:</strong> teacher1@school.com / teacher123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Student:</strong> student1@school.com / student123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
