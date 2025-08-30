// src/app/dashboard/cspm/page.tsx  (or wherever your CSPM page lives)
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { scanCSPM, scanCSPMMulti } from "@/lib/api";

export default function CSPMScanPage() {
  const { session } = useAuth();
  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "completed" | "error"
  >("idle");
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMultiTenant, setUseMultiTenant] = useState(false);

  const handleStartScan = async () => {
    const token = session?.access_token;
    if (!token) {
      setError("You must be logged in to perform a scan");
      return;
    }

    setScanStatus("scanning");
    setError(null);
    setScanResults(null);

    try {
      const response = useMultiTenant
        ? await scanCSPMMulti(token)
        : await scanCSPM(token);

      if (response?.status === "ok") {
        setScanResults(response.results);
        setScanStatus("completed");
      } else {
        setError(response?.error || "Scan failed");
        setScanStatus("error");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err?.message || "Failed to perform scan. Please try again.");
      setScanStatus("error");
    }
  };

  const handleDownloadJSON = () => {
  if (!scanResults) return;

  const dataStr = JSON.stringify(scanResults, null, 2); // pretty print
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `cspm_scan_${new Date().toISOString()}.json`;
  link.click();

  URL.revokeObjectURL(url);
};


  // Helpers for rendering safely
  const ec2Reservations =
    scanResults?.ec2?.ec2_instances?.Reservations ?? [];
  const s3Buckets = scanResults?.s3?.s3_buckets ?? [];
  const iamUsers = scanResults?.iam?.Users ?? [];


  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            CSPM Scan
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cloud Security Posture Management - Scan your AWS environment for security issues
          </p>
        </div>
      </div>

      {/* Scan Controls card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-center">
          {/* Left: description and checkbox (spans 2 cols on md+) */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Run Security Scan
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Perform a comprehensive scan of your AWS environment to identify
              security issues.
            </p>

            <div className="mt-3 flex items-center">
              <input
                id="multi-tenant"
                type="checkbox"
                checked={useMultiTenant}
                onChange={(e) => setUseMultiTenant(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="multi-tenant"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Use multi-tenant scan (requires AWS account setup)
              </label>
            </div>
          </div>

          {/* Right: button */}
          <div className="flex items-center justify-start md:justify-end">
            <button
              onClick={handleStartScan}
              disabled={scanStatus === "scanning" || !session}
              className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium shadow
                transition transform duration-150
                ${
                  scanStatus === "scanning" || !session
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                }`}
              aria-busy={scanStatus === "scanning"}
            >
              {scanStatus === "scanning" ? "Scanning..." : "Start Scan"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Error
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading card */}
      {scanStatus === "scanning" && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center mb-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Scanning in progress
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We're scanning your AWS environment for security issues. This may
            take a few minutes.
          </p>
        </div>
      )}

      {/* Results */}
      {scanStatus === "completed" && scanResults && (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleDownloadJSON}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Download JSON
            </button>
          </div>
          {/* EC2 Instances */}
          <section className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                EC2 Instances
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Instance ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Launch Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ec2Reservations.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                        No EC2 instances found.
                      </td>
                    </tr>
                  )}
                  {ec2Reservations.flatMap((res: any, rIdx: number) =>
                    (res.Instances ?? []).map((inst: any, iIdx: number) => (
                      <tr
                        key={inst.InstanceId ?? `${rIdx}-${iIdx}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono">{inst.InstanceId ?? "-"}</td>
                        <td className="px-6 py-4 text-sm">{inst.InstanceType ?? "-"}</td>
                        <td className="px-6 py-4 text-sm">{inst.LaunchTime ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {ec2Reservations.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No EC2 instances found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ec2Reservations.flatMap((res: any, rIdx: number) =>
                    (res.Instances ?? []).map((inst: any, iIdx: number) => (
                      <div
                        key={inst.InstanceId ?? `${rIdx}-${iIdx}`}
                        className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Instance ID</span>
                            <span className="text-sm font-mono text-gray-900 dark:text-white ml-2 break-all">{inst.InstanceId ?? "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</span>
                            <span className="text-sm text-gray-900 dark:text-white">{inst.InstanceType ?? "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Launch Time</span>
                            <span className="text-sm text-gray-900 dark:text-white">{inst.LaunchTime ?? "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* S3 Buckets */}
          <section className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                S3 Buckets
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Bucket Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Creation Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {s3Buckets.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-6 text-center text-sm text-gray-500">
                        No buckets found.
                      </td>
                    </tr>
                  )}
                  {s3Buckets.map((bucket: any) => (
                    <tr key={bucket.Name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">{bucket.Name}</td>
                      <td className="px-6 py-4 text-sm">{bucket.CreationDate ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {s3Buckets.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No buckets found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {s3Buckets.map((bucket: any) => (
                    <div
                      key={bucket.Name}
                      className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bucket Name</span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white ml-2 break-all">{bucket.Name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Creation Date</span>
                          <span className="text-sm text-gray-900 dark:text-white">{bucket.CreationDate ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* IAM Users */}
          <section className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                IAM Users
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      User Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {iamUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                        No IAM users found.
                      </td>
                    </tr>
                  )}
                  {iamUsers.map((user: any) => (
                    <tr key={user.UserId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm">{user.UserName}</td>
                      <td className="px-6 py-4 text-sm font-mono">{user.UserId}</td>
                      <td className="px-6 py-4 text-sm">{user.CreateDate ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {iamUsers.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No IAM users found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {iamUsers.map((user: any) => (
                    <div
                      key={user.UserId}
                      className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User Name</span>
                          <span className="text-sm text-gray-900 dark:text-white ml-2">{user.UserName}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User ID</span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white ml-2 break-all">{user.UserId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</span>
                          <span className="text-sm text-gray-900 dark:text-white">{user.CreateDate ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          {/* IAM Findings */}
          <section className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                IAM Findings
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {scanResults?.iam?.findings?.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                        No IAM findings.
                      </td>
                    </tr>
                  )}
                  {scanResults?.iam?.findings?.map((finding: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">{finding.resource}</td>
                      <td className="px-6 py-4 text-sm">{finding.issue}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          finding.severity?.toLowerCase() === 'high' || finding.severity?.toLowerCase() === 'critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : finding.severity?.toLowerCase() === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {finding.severity || 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {scanResults?.iam?.findings?.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No IAM findings.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {scanResults?.iam?.findings?.map((finding: any, idx: number) => (
                    <div
                      key={idx}
                      className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resource</span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white ml-2 break-all">{finding.resource}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue</span>
                          <span className="text-sm text-gray-900 dark:text-white ml-2">{finding.issue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Severity</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                            finding.severity?.toLowerCase() === 'high' || finding.severity?.toLowerCase() === 'critical'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : finding.severity?.toLowerCase() === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {finding.severity || 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      )}

      {/* When completed but no results */}
      {scanStatus === "completed" && !scanResults && (
        <div className="text-center text-sm text-gray-500">Scan completed — no data returned.</div>
      )}
    </div>
  );
}
