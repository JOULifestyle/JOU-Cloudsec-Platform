// src/pages/DashboardPage.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats } from "@/lib/api";

interface DashboardStats {
  totalScans: number;
  criticalFindings: number;
  mediumFindings: number;
  lowFindings: number;
}

interface TrendData {
  date: string;
  scans: number;
}

const reviews = [
  { name: "Alice", feedback: "JOU CloudSec keeps our AWS environment secure!" },
  { name: "Bob", feedback: "Great dashboard, easy to understand security trends." },
  { name: "Charlie", feedback: "Very useful for monitoring our cloud posture." },
];

const DashboardPage = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    criticalFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      try {
        setLoading(true);
        const token = session.access_token;
        const statsResponse = await getDashboardStats(token);
        if (statsResponse.status === "ok") {
          setStats({
            totalScans: statsResponse.total_scans || 0,
            criticalFindings: statsResponse.critical_findings || 0,
            mediumFindings: statsResponse.medium_findings || 0,
            lowFindings: statsResponse.low_findings || 0,
          });
          setTrendData(statsResponse.trend || []);
        } else {
          setError("Failed to fetch dashboard data");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleContactSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!session) {
    setContactStatus("You must be logged in to send a message.");
    return;
  }

  try {
    const token = session.access_token;

    const response = await fetch("http://localhost:8000/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // send JWT if backend is protected
      },
      body: JSON.stringify(contactForm),
    });

    if (response.ok) {
      setContactStatus("Message sent successfully!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } else {
      const data = await response.json();
      setContactStatus(data.detail || "Failed to send message. Try again.");
    }
  } catch (err) {
    console.error(err);
    setContactStatus("Failed to send message. Try again.");
  }
};

  return (
    <div>
      {/* Main content */}
      <main className="p-4">
        {/* Hero Section */}
        <section className="bg-indigo-600 text-white py-20 px-6 text-center lg:text-left rounded-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome to JOU CloudSec</h1>
          <p className="text-lg max-w-2xl mx-auto lg:mx-0">
            Stay ahead of threats — secure your AWS with real-time CSPM & CWPP intelligence.
          </p>
        </section>

        {/* Banner Image */}
        <section className="w-full mt-6">
          <img
            src="man-sitting-and-smilling.jpg"
            alt="Cloud Security Banner"
            className="relative w-[700px] h-96 lg:h-[500px] rounded-lg overflow-hidden"
          />
        </section>

        {/* Dashboard Stats */}
        <section className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {loading ? (
            <p>Loading dashboard data...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Total Scans</h3>
                    <p className="text-2xl font-bold">{stats.totalScans}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Critical Findings</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.criticalFindings}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Medium Findings</h3>
                    <p className="text-2xl font-bold text-yellow-500">{stats.mediumFindings}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">Low Findings</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.lowFindings}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg rounded-2xl mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Scan Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="scans" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        {/* Customer Reviews */}
        <section className="bg-gray-50 dark:bg-gray-800 p-6 mt-6 space-y-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <Card key={idx} className="shadow-lg rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-gray-700 dark:text-gray-200">&quot;{review.feedback}&quot;</p>
                  <p className="mt-2 font-semibold text-gray-900 dark:text-white">- {review.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="p-6 mt-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Contact Us</h2>
          <form
            onSubmit={handleContactSubmit}
            className="max-w-xl mx-auto space-y-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          >
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
             <div>
              <label className="block mb-1 text-sm font-medium">Subject</label>
              <input
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Message</label>
              <textarea
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition"
            >
              Send Message
            </button>
            {contactStatus && <p className="text-center mt-2">{contactStatus}</p>}
          </form>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
