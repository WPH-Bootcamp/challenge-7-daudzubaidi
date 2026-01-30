import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for development
      },
    ],
    // Fallback to unoptimized images if optimization fails
    unoptimized: false,
  },
};

export default nextConfig;
