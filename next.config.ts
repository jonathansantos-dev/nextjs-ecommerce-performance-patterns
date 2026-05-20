import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    // Allow external image domains used in the mock product catalog
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Enforce modern formats — AVIF first, WebP fallback
    formats: ['image/avif', 'image/webp'],
  },

  // Strict mode to surface rendering issues in development
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features used in this project
  experimental: {
    // Optimizes CSS delivery
    optimizeCss: true,
  },
};

export default withBundleAnalyzer(nextConfig);
