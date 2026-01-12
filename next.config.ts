import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Production optimizations
  poweredByHeader: false,
  
  // Enable React strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;
