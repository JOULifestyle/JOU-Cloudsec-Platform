'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (resetMode) {
      // Handle password reset
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/auth/login?mode=reset`,
        });

        if (error) {
          setError(error.message);
        } else {
          setResetSuccess(true);
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Password reset error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle login
      try {
        const { error } = await signIn(email, password);

        if (error) {
          setError(error.message);
        } else {
          // Redirect to dashboard on successful login
          router.push('/dashboard');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            JOU Cloud Security Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {resetMode ? 'Reset your password' : 'Sign in to your account'}
          </p>
        </div>
        {resetSuccess ? (
          <div className="mt-8">
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                Password reset email sent!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Check your email for instructions to reset your password.
              </p>
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSuccess(false);
                  setResetEmail('');
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                ← Back to login
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            )}

            {resetMode ? (
              // Password Reset Form
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                    placeholder="Enter your email address"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    We'll send you a link to reset your password
                  </p>
                </div>
              </div>
            ) : (
              // Login Form
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                    placeholder="Password"
                  />
                </div>
              </div>
            )}

            {!resetMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setError('');
                    }}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <span>{resetMode ? 'Sending reset email...' : 'Signing in...'}</span>
                ) : (
                  <span>{resetMode ? 'Send reset email' : 'Sign in'}</span>
                )}
              </button>
            </div>

            {resetMode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError('');
                    setResetEmail('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Back to login
                </button>
              </div>
            )}
          </form>
        )}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                New to JOU CloudSec?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Sign up for an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}