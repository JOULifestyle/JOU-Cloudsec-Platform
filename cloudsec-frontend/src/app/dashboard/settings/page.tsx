'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState({
    account: true,
    notifications: false,
    appearance: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // TODO: Implement settings save API call
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
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

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Configure your account preferences and application settings here.
      </p>

      {/* Account Settings */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold text-left text-gray-900 dark:text-gray-100"
          onClick={() => toggleSection('account')}
        >
          <div className="flex items-center">
            Account Settings
            <Tooltip text="Change your email, password, and other account details" />
          </div>
          <span>{openSections.account ? '-' : '+'}</span>
        </button>
        {openSections.account && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold text-left text-gray-900 dark:text-gray-100"
          onClick={() => toggleSection('notifications')}
        >
          <div className="flex items-center">
            Notification Preferences
            <Tooltip text="Set how you receive alerts and notifications" />
          </div>
          <span>{openSections.notifications ? '-' : '+'}</span>
        </button>
        {openSections.notifications && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
            <p className="italic text-sm text-gray-500 dark:text-gray-400">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold text-left text-gray-900 dark:text-gray-100"
          onClick={() => toggleSection('appearance')}
        >
          <div className="flex items-center">
            Appearance
            <Tooltip text="Customize light/dark mode and other UI preferences" />
          </div>
          <span>{openSections.appearance ? '-' : '+'}</span>
        </button>
        {openSections.appearance && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
            <p className="italic text-sm text-gray-500 dark:text-gray-400">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Save button */}
      <div>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {success && <p className="text-green-600 mt-2">Settings saved successfully!</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
