'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false, // 🔥 IMPORTANT
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    // 🔥 Fetch session to get role
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    const role = session?.user?.role;

    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'TEACHER') {
      router.push('/teacher');
    } else if (role === 'STUDENT') {
      router.push('/student');
    } else {
      router.push('/');
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border p-2 rounded"
        />

        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full border p-2 rounded"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
