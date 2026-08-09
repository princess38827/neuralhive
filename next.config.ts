import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the app as a normal Next.js deployment for Vercel.
  // Vercel handles the build output automatically.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
