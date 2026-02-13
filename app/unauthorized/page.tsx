import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl text-center">
        <div className="flex justify-center">
          <XCircle className="w-20 h-20 text-red-600" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-4">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
          >
            Go to Home
          </Link>
          
          <Link
            href="/login"
            className="block w-full px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
