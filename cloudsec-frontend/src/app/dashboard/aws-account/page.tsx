'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storeAWSAccount, getAWSAccount } from '@/lib/api';

export default function AWSAccountPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const [accountId, setAccountId] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Fetch existing AWS account info
  useEffect(() => {
    const fetchAWSAccount = async () => {
      if (!accessToken) {
        setFetching(false);
        return;
      }

      try {
        const response = await getAWSAccount(accessToken);
        if (response.status === 'ok' && response.data) {
          setAccountId(response.data.account_id || '');
          setRoleArn(response.data.role_arn || '');
        }
      } catch (err: any) {
        console.error('Error fetching AWS account info:', err);
        setError(err.message || 'Failed to fetch AWS account info');
      } finally {
        setFetching(false);
      }
    };

    fetchAWSAccount();
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!accessToken) {
      setError('Please log in again to save AWS account information.');
      setLoading(false);
      return;
    }

    if (!accountId || !roleArn) {
      setError('Both Account ID and Role ARN are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await storeAWSAccount(accessToken, accountId, roleArn);
      if (response.status === 'ok') {
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to save AWS account information');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save AWS account information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <div className="py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">AWS Account Setup</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Configure your AWS account for security scanning
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <h2 className="text-base sm:text-lg font-semibold">Setup Instructions</h2>
          <button
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors self-start sm:self-auto"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
        </div>

        {showInstructions && (
          <div className="text-sm space-y-4 overflow-x-auto">
            {/* Instructions content (unchanged) */}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-green-700 dark:text-green-400 text-sm">AWS account information saved successfully!</p>
        </div>
      )}

      {/* AWS Account Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AWS Account ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="123456789012"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          {/* Role ARN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role ARN
            </label>
            <input
              type="text"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
              placeholder="arn:aws:iam::123456789012:role/CloudSecScanRole"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !accessToken || !accountId || !roleArn}
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
            {(accountId || roleArn) && (
              <button
                type="button"
                onClick={() => {
                  setAccountId('');
                  setRoleArn('');
                  setError(null);
                  setSuccess(false);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Form
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
