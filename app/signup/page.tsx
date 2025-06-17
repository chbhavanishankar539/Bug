'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      router.push('/login?signupSuccess=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1510519138101-570d1dca3d6b?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', // Same background as login
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-red bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        {/* Left Section - Welcome (reused from login) */}
        <div className="w-full md:w-1/2 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center text-2xl font-bold mb-8">
              <svg className="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.278 1.5l-6.84 6.84a1 1 0 00-.03 1.41l3.52 3.52a1 1 0 001.41.03L18.5 10.722a1 1 0 00.03-1.41l-3.52-3.52a1 1 0 00-1.41-.03L9.278 1.5zM12 11a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span>BUG TRACKER</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Create Account</h2>
            <p className="text-xl font-semibold mb-6">Join Our Community.</p>
            <p className="text-sm mb-8 leading-relaxed">
              Create an account to start tracking bugs and issues.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.819c-3.266 0-5.181 1.986-5.181 5.006v2.994z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.774 1.624 4.902 4.902.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.624 4.774-4.902 4.902-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.774-1.624-4.902-4.902-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.624-4.774 4.902-4.902 1.266-.058 1.646-.07 4.85-.07zm0 2.163c-3.216 0-3.627.01-4.868.067-2.616.12-3.731 1.157-3.856 3.856-.058 1.241-.067 1.652-.067 4.868s.01 3.627.067 4.868c.12 2.616 1.157 3.731 3.856 3.856 1.241.058 1.652.067 4.868.067s3.627-.01 4.868-.067c2.616-.12 3.731-1.157 3.856-3.856.058-1.241.067-1.652.067-4.868s-.01-3.627-.067-4.868c-.12-2.616-1.157-3.731-3.856-3.856-1.241-.058-1.652-.067-4.868-.067zm0 1.488c-3.266 0-5.592 2.326-5.592 5.592s2.326 5.592 5.592 5.592 5.592-2.326 5.592-5.592-2.326-5.592-5.592-5.592zm0 2.163c2.002 0 3.429 1.427 3.429 3.429s-1.427 3.429-3.429 3.429-3.429-1.427-3.429-3.429 1.427-3.429 3.429-3.429zm5.955-3.568c0-.709-.575-1.284-1.284-1.284s-1.284.575-1.284 1.284.575 1.284 1.284 1.284 1.284-.575 1.284-1.284z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.484 0-6.303 2.819-6.303 6.303 0 .495.056.974.138 1.436-5.241-.263-9.873-2.788-12.985-6.6-.547.935-.85 2.012-.85 3.161 0 2.182 1.115 4.097 2.81 5.23-.207-.006-.4-.016-.592-.164v.079c0 3.059 2.16 5.593 5.03 6.187-.442.122-.912.186-1.395.186-.343 0-.67-.033-.99-.095.803 2.492 3.12 4.312 5.862 4.364-2.102 1.648-4.756 2.62-7.697 2.62-.501 0-.998-.03-1.48-.087 3.327 2.137 7.26 3.398 11.492 3.398 13.8 0 21.31-11.499 21.31-21.31 0-.324-.008-.647-.022-.968.913-.659 1.708-1.474 2.373-2.423z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Section - Sign Up Form */}
        <div className="w-full md:w-1/2 p-8 bg-white bg-opacity-90 rounded-r-xl flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Sign Up</h2>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-200 peer bg-transparent text-gray-900"
                  placeholder=" "
                />
                <label
                  htmlFor="name"
                  className="absolute left-0 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs"
                >
                  Name
                </label>
                <UserIcon className="h-5 w-5 text-gray-400 absolute right-0 top-3" />
              </div>

              <div className="relative mt-6">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-200 peer bg-transparent text-gray-900"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs"
                >
                  Email
                </label>
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute right-0 top-3" />
              </div>

              <div className="relative mt-6">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-200 peer bg-transparent text-gray-900"
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs"
                >
                  Password
                </label>
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute right-0 top-3" />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-900">
              Already have an account? {' '}
              <a href="/login" className="font-medium text-red-600 hover:text-red-500">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 