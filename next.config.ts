import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['ag-grid-community', 'ag-grid-react', 'xlsx'],
  images: {
    domains: [], // Add any external image domains if needed
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config: any, { isServer }) => {
    // Add fallbacks for node modules that xlsx might need
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        buffer: false,
        crypto: false,
        stream: false,
        process: false,
        // Exclude AWS SDK from client-side bundle
        '@aws-sdk/client-ses': false,
      };
    }
    return config;
  },
};

export default nextConfig;