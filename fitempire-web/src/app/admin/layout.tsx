'use client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from '@/admin/store';
import { theme } from '@/admin/theme';
import { DashboardLayout } from '@/admin/layouts/DashboardLayout';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } }
    }));

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
                        <DashboardLayout>{children}</DashboardLayout>
                    </SnackbarProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
}
