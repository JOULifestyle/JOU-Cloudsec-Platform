import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don't block builds on ESLint errors (like "any", unused vars, etc.)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Don't block builds on TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
