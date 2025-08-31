'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { session, user, signOut } = useAuth(); // get user info
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'CSPM Scan', href: '/dashboard/cspm', icon: '🔒' },
    { name: 'CWPP Scan', href: '/dashboard/cwpp', icon: '🛡️' },
    { name: 'Scan History', href: '/dashboard/history', icon: '📜' },
    { name: 'AWS Account', href: '/dashboard/aws-account', icon: '☁️' },
    {name: 'Contact', href: '/dashboard/contact', icon: '✉️' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  // first letter of email for avatar
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';
  const email = user?.email ?? 'Not logged in';

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition duration-300 ease-in-out lg:h-screen lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  JC
                </div>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">JOU CloudSec</h2>
              </div>
            </div>
            <button
              className="lg:hidden text-gray-500 dark:text-gray-400"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center">
              <div className="flex-shrink-0 relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {initial}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/dashboard/profile');
                          setUserMenuOpen(false);
                          setSidebarOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Your Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{email}</p>
              </div>
            </div>

            {/* Click outside to close dropdown */}
            {userMenuOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
