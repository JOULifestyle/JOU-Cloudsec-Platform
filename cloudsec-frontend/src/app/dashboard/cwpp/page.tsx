"use client";
import { useState } from "react";
import { scanCWPP } from "@/lib/api";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CWPPScanPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("No auth token found");

      const res = await scanCWPP(token);
      console.log("CWPP scan response:", res);

      if (res.status !== "ok" || !res.results) {
        throw new Error("Invalid scan results");
      }

      setResults(res);
    } catch (err: any) {
      console.error("CWPP scan failed:", err);
      setError(err.message || "Failed to fetch CWPP scan results");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;

    const findings = results.results.findings || [];
    const header = ["Type", "Message", "Severity"];
    const rows = findings.map((f: any) => [f.type, f.message, f.severity]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cwpp_scan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const findings = results?.results?.findings || [];
  const scanType = results?.results?.scan_type || "";
  const timestamp = results?.results?.timestamp
    ? new Date(results.results.timestamp).toLocaleString()
    : "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">CWPP Scan</h1>

      <button
        onClick={handleScan}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Run CWPP Scan
      </button>

      {loading && <p className="mt-4 text-gray-500">Scanning...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {findings.length > 0 && (
        <div className="mt-6">
          <div className="mb-2">
            <p>
              <strong>Scan Type:</strong> {scanType.toUpperCase()}
            </p>
            <p>
              <strong>Timestamp:</strong> {timestamp}
            </p>
          </div>

          <h2 className="text-lg font-semibold mb-2">Scan Findings</h2>
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Message</th>
                <th className="p-2 border">Severity</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f: any, idx: number) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{f.type}</td>
                  <td className="p-2 border">{f.message}</td>
                  <td className="p-2 border">{f.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download CSV
          </button>
        </div>
      )}

      {!loading && !error && findings.length === 0 && (
        <p className="mt-4 text-gray-500">
          No findings found. Click "Run CWPP Scan" to start.
        </p>
      )}
    </div>
  );
}
