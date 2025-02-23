import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    }];
    return config;
  },
}

export default nextConfig
