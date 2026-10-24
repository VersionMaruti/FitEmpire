import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    outputFileTracingRoot: path.join(__dirname, '../'),
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '8080' },
            { protocol: 'https', hostname: 'cdn.fitempire.tech' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' http://localhost:8080 http://localhost:3000 http://localhost:3001 https://api.razorpay.com https: wss:; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;",
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(self), microphone=(), geolocation=(self)',
                    },
                ],
            },
        ];
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
