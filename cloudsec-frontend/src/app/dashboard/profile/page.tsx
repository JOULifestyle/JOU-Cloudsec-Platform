'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { accessToken, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // TODO: Call your API to update profile
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Simple tooltip component
  const Tooltip = ({ text }: { text: string }) => (
    <span className="relative group">
      <InformationCircleIcon className="h-5 w-5 text-gray-400 ml-2 inline-block cursor-pointer" />
      <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        {text}
      </span>
    </span>
  );

  if (authLoading) {
    return (
      <div className="py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow space-y-4">
        {/* Name */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <label className="text-sm font-medium">Name</label>
          <div className="flex items-center w-full md:w-2/3 mt-1 md:mt-0">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Tooltip text="Your full name" />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <label className="text-sm font-medium">Email</label>
          <div className="flex items-center w-full md:w-2/3 mt-1 md:mt-0">
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Tooltip text="Your login email; changing this may require re-verification" />
          </div>
        </div>

        {/* Save button */}
        <div>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          {success && <p className="text-green-600 mt-2">Profile saved successfully!</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
