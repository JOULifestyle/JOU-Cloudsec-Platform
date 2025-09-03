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
  const [showInstructions, setShowInstructions] = useState(true);

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
    <div className="py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">AWS Account Setup</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Configure your AWS account for security scanning
        </p>
      </div>

      {/* Instructions - Collapsible */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
          <div className="text-sm space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                When a new user signs up, create an IAM role in your AWS account to allow CloudSec to perform security scans.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  1. CloudFormation Template (Recommended)
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Use this CloudFormation template to automatically create the IAM role:
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs border border-gray-300 dark:border-gray-600">
                  <pre className="whitespace-pre-wrap break-all">
{`AWSTemplateFormatVersion: '2010-09-09'
Description: 'CloudFormation template for CloudSec'

Parameters:
  CloudSecAccountId:
    Type: String
    Default: 'YOUR_CLOUDSEC_ACCOUNT_ID'

Resources:
  CloudSecScanRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: CloudSecScanRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub "arn:aws:iam::\${CloudSecAccountId}:root"
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/SecurityAudit
        - arn:aws:iam::aws:policy/ViewOnlyAccess

Outputs:
  RoleArn:
    Value: !GetAtt CloudSecScanRole.Arn`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                  2. Manual Creation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Or manually create the IAM role with this trust policy:
                </p>
                <div className="bg-gray-900 text-yellow-400 p-3 rounded text-xs border border-gray-300 dark:border-gray-600">
                  <pre className="whitespace-pre-wrap break-all">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_CLOUDSEC_ACCOUNT_ID:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`}
                  </pre>
                </div>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-sm font-medium mb-1">Required Permissions:</p>
                  <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Trust policy allowing CloudSec to assume the role</li>
                    <li>• Managed policies: <code>SecurityAudit</code> and <code>ViewOnlyAccess</code></li>
                  </ul>
                </div>
              </div>
            </div>
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
          <p className="text-green-700 dark:text-green-400 text-sm">
            AWS account information saved successfully!
          </p>
        </div>
      )}

      {/* AWS Account Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AWS Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="123456789012"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your 12-digit AWS account ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role ARN
              </label>
              <input
                type="text"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                placeholder="arn:aws:iam::123456789012:role/CloudSecScanRole"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The ARN of the IAM role created for CloudSec scanning
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !accessToken || !accountId || !roleArn}
              className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Configuration'
              )}
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
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
