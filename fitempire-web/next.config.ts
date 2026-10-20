import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '8080' },
            { protocol: 'https', hostname: 'cdn.fitempire.tech' },
        ],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
