'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  // Don't show navigation on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-8 w-32 bg-gray-600 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  // Don't show navigation if not authenticated
  if (!session) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-white tracking-wide">
                BUG TRACKER
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-3 pt-1 border-b-2 text-base font-medium transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className={`inline-flex items-center px-3 pt-1 border-b-2 text-base font-medium transition-colors duration-200 ${
                  isActive('/tasks')
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/time-tracking"
                className={`inline-flex items-center px-3 pt-1 border-b-2 text-base font-medium transition-colors duration-200 ${
                  isActive('/time-tracking')
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Time Tracking
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {session?.user?.name}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSigningOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing out...
                    </>
                  ) : (
                    'Sign out'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 