"use client";
import React, { useEffect, useState } from "react";
import { getUserScanHistory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ScanHistoryPage() {
  const { session } = useAuth();
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: extract findings from top-level or nested service blocks
  const extractFindings = (scan: any) => {
    const findings: any[] = [];
    const root = scan?.data?.results ?? scan?.data ?? {};

    if (Array.isArray(root.findings)) {
      findings.push(...root.findings);
    }
    for (const [_k, value] of Object.entries(root || {})) {
      if (value && typeof value === "object" && Array.isArray((value as any).findings)) {
        findings.push(...(value as any).findings);
      }
    }
    return findings;
  };

  useEffect(() => {
    async function fetchHistory() {
      try {
        if (!session) return;
        const data = await getUserScanHistory(session.access_token);
        if (data && Array.isArray(data.history)) {
          setScanHistory(data.history);
        } else {
          console.warn("Unexpected scan history response:", data);
          setScanHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch scan history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [session]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(scanHistory, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scan_history.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!scanHistory.length) return;
    const headers = ["ID", "Scan Type", "Timestamp", "Findings"];
    const rows = scanHistory.map((scan) => {
      const scanType = scan.data?.scan_type || scan.data?.results?.scan_type || "Unknown";
      const scanTimestamp = scan.data?.timestamp || scan.timestamp || "N/A";
      const findings = extractFindings(scan)
        .map(
          (f: any) =>
            `${f.issue || f.type}: ${f.message || f.resource || "—"} (${
              f.severity || "N/A"
            })`
        )
        .join(" | ");
      return [
        scan.id,
        scanType,
        new Date(scanTimestamp).toLocaleString(),
        findings || "No findings",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scan_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!scanHistory.length) return <p className="p-4">No scan history available.</p>;

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold">Scan History</h1>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Download CSV
            </button>
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download JSON
            </button>
          </div>
        </div>

        {/* TABLE: only visible md+ */}
        <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Scan Type</th>
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Findings</th>
              </tr>
            </thead>
            <tbody>
              {scanHistory.map((scan) => {
                const scanType =
                  scan.data?.scan_type || scan.data?.results?.scan_type || "Unknown";
                const scanTimestamp = scan.data?.timestamp || scan.timestamp || "N/A";
                const findings = extractFindings(scan);
                return (
                  <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 border">{scan.id}</td>
                    <td className="px-4 py-2 border">{String(scanType).toUpperCase()}</td>
                    <td className="px-4 py-2 border">
                      {new Date(scanTimestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {findings.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {findings.map((f: any, i: number) => (
                            <li key={i}>
                              <span className="font-semibold">{f.issue || f.type}:</span>{" "}
                              {f.message || f.resource || "—"} ({f.severity || "N/A"})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No findings"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CARDS: only visible < md */}
        <div className="space-y-4 md:hidden">
          {scanHistory.map((scan) => {
            const scanType =
              scan.data?.scan_type || scan.data?.results?.scan_type || "Unknown";
            const scanTimestamp = scan.data?.timestamp || scan.timestamp || "N/A";
            const findings = extractFindings(scan);
            return (
              <div
                key={scan.id}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <p className="text-sm"><span className="font-semibold">ID:</span> {scan.id}</p>
                <p className="text-sm"><span className="font-semibold">Scan Type:</span> {String(scanType).toUpperCase()}</p>
                <p className="text-sm"><span className="font-semibold">Timestamp:</span> {new Date(scanTimestamp).toLocaleString()}</p>
                <div className="mt-2">
                  <span className="font-semibold">Findings:</span>
                  {findings.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {findings.map((f: any, i: number) => (
                        <li key={i} className="text-sm">
                          {f.issue || f.type}: {f.message || f.resource || "—"} ({f.severity || "N/A"})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">No findings</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
