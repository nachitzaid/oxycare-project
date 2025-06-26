import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    config.watchOptions = {
      poll: false,
      aggregateTimeout: 300,
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/.next',
        '**/dist',
        '**/build',
        '**/coverage',
        '**/.turbo',
        '**/public',
        '**/logs',
        '**/cache',
        '**/tmp',
        '**/temp',
      ],
    }
    return config;
  },
  experimental: {
    webpackBuildWorker: false,
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react', 'react-icons'],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
