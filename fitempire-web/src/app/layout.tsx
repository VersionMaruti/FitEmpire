import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';

export const metadata: Metadata = {
    title: "FitEmpire — India's Fitness Membership Platform",
    description: 'Discover gyms, book classes, and manage your fitness memberships across India.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider>
                    {children}
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
