/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Fix node:child_process and other Node.js module imports in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'path': false,
        'os': false,
        'crypto': false,
        'stream': false,
        'constants': false,
        'timers': false,
        'buffer': false,
        'process': false,
        'url': false,
        'zlib': false,
        'http': false,
        'https': false,
        'net': false,
        'tls': false,
        'util': false,
        'querystring': false,
      };
      
      // Handle node:* imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:child_process': false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        'node:crypto': false,
        'node:stream': false,
        'node:constants': false,
        'node:timers': false,
        'node:buffer': false,
        'node:process': false,
        'node:url': false,
        'node:zlib': false,
        'node:http': false,
        'node:https': false,
        'node:net': false,
        'node:tls': false,
        'node:util': false,
        'node:querystring': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
