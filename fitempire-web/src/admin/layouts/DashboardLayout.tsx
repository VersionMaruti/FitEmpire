'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, IconButton, Avatar,
  Badge, Tooltip, Divider, useTheme, CircularProgress,
} from '@mui/material';
import {
  Dashboard, People, FitnessCenter, CardMembership, Payment,
  BarChart, EventNote, Notifications, Settings, ChevronLeft,
  ChevronRight, Logout, NotificationsNone, Search, CalendarMonth,
  VerifiedUser, CurrencyRupee,
} from '../icons';
import { Dumbbell } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { logout, toggleSidebar } from '../store';
import { authApi } from '../api';
import { getPartnerAppUrl, getMemberAppUrl } from '@/config/links';

const DRAWER_WIDTH = 268;
const DRAWER_COLLAPSED = 72;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Users', icon: <People />, path: '/admin/users' },
  { label: 'Gyms', icon: <FitnessCenter />, path: '/admin/gyms' },
  { label: 'Memberships', icon: <CardMembership />, path: '/admin/memberships' },
  { label: 'Payments', icon: <Payment />, path: '/admin/payments' },
  { label: 'Bookings', icon: <EventNote />, path: '/admin/bookings' },
  { label: 'Classes', icon: <CalendarMonth />, path: '/admin/classes' },
  { label: 'Analytics', icon: <BarChart />, path: '/admin/analytics' },
  { label: 'Partner Onboarding', icon: <FitnessCenter />, path: '/admin/onboarding' },
  { label: 'Verification Queue', icon: <VerifiedUser />, path: '/admin/verification' },
  { label: 'Settlements', icon: <CurrencyRupee />, path: '/admin/settlements' },
  { label: 'Notifications', icon: <Notifications />, path: '/admin/notifications' },
  { label: 'Settings', icon: <Settings />, path: '/admin/settings' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const user = useSelector((s: RootState) => s.auth.user);
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPartner = user?.role === 'PARTNER' || user?.role === 'GYM_PARTNER';

  useEffect(() => {
    if (!mounted) return;
    const superAdminOnlyPaths = ['/admin/gyms', '/admin/users', '/admin/onboarding', '/admin/verification', '/admin/settlements', '/admin/analytics', '/admin/memberships'];
    if (isPartner && superAdminOnlyPaths.some((p) => pathname.startsWith(p))) {
      router.replace('/admin/dashboard');
    }
  }, [mounted, user, pathname, isPartner, router]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    document.cookie = 'fitempire_access_token=; path=/; max-age=0; SameSite=Lax';
    dispatch(logout());
    router.push('/admin/login');
  };

  // Don't render sidebar or topbar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent SSR hydration mismatch between server (user: null) and client (user: Gym Partner from localStorage)
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0D18 100%)',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#6C63FF' }} size={38} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 200,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: 200,
            }),
            border: 'none',
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            px: sidebarOpen ? 3 : 1,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 72,
          }}
        >
          {sidebarOpen && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(108, 99, 255, 0.45)',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
                >
                  <path d="M6.5 6.5 17.5 17.5" />
                  <path d="m21 21-1-1" />
                  <path d="m3 3 1 1" />
                  <path d="m18 22 4-4" />
                  <path d="m2 6 4-4" />
                  <path d="m3 10 7-7" />
                  <path d="m14 21 7-7" />
                  <path d="M6.5 12.5 12.5 6.5" />
                  <path d="m11.5 17.5 6-6" />
                </svg>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: '#F0F0FF' }}>
                  FitEmpire
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B5CF6', fontWeight: 700 }}>
                  Admin Console
                </Typography>
              </Box>
            </Box>
          )}
          {!sidebarOpen && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(108, 99, 255, 0.45)',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
              >
                <path d="M6.5 6.5 17.5 17.5" />
                <path d="m21 21-1-1" />
                <path d="m3 3 1 1" />
                <path d="m18 22 4-4" />
                <path d="m2 6 4-4" />
                <path d="m3 10 7-7" />
                <path d="m14 21 7-7" />
                <path d="M6.5 12.5 12.5 6.5" />
                <path d="m11.5 17.5 6-6" />
              </svg>
            </Box>
          )}
          {sidebarOpen && (
            <IconButton onClick={() => dispatch(toggleSidebar())} size="small" sx={{ color: 'text.secondary' }}>
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1.5, py: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.filter((item) => {
            if (user?.role === 'PARTNER' || user?.role === 'GYM_PARTNER') {
              return ['/admin/dashboard', '/admin/bookings', '/admin/classes', '/admin/payments', '/admin/notifications', '/admin/settings'].includes(item.path);
            }
            return true;
          }).map((item) => {
            const active = pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={!sidebarOpen ? item.label : ''} placement="right">
                  <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'block' }}>
                    <ListItemButton
                      selected={pathname === item.path}
                      sx={{
                        borderRadius: 3,
                        minHeight: 48,
                        justifyContent: sidebarOpen ? 'initial' : 'center',
                        px: sidebarOpen ? 2 : 1.5,
                        background: active
                          ? 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,101,132,0.1) 100%)'
                          : 'transparent',
                        border: active ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid transparent',
                        '&:hover': {
                          background: 'rgba(108, 99, 255, 0.1)',
                          border: '1px solid rgba(108, 99, 255, 0.2)',
                        },
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: sidebarOpen ? 2 : 'auto',
                          justifyContent: 'center',
                          color: active ? 'primary.main' : 'text.secondary',
                          '& svg': { fontSize: 22 },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {sidebarOpen && (
                        <ListItemText
                          primary={item.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              fontWeight: active ? 700 : 500,
                              color: active ? 'primary.main' : 'text.primary',
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Link>

                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        {/* User Footer */}
        <Divider sx={{ borderColor: 'divider' }} />
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 3,
              background: 'rgba(108, 99, 255, 0.06)',
              cursor: 'pointer',
              '&:hover': { background: 'rgba(108, 99, 255, 0.12)' },
              transition: 'background 0.15s ease',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0] || 'A'}
            </Avatar>
            {sidebarOpen && (
              <>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {user?.firstName || 'Admin'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {user?.role || 'SUPER_ADMIN'}
                  </Typography>
                </Box>
                <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
                  <Logout fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
          {!sidebarOpen && (
            <IconButton
              onClick={() => dispatch(toggleSidebar())}
              sx={{ mt: 1, width: '100%', color: 'text.secondary' }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
              {NAV_ITEMS.find(n => n.path === pathname)?.label || 'FitEmpire Admin'}
            </Typography>

            {/* Portal Switcher Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <Tooltip title="Open FitEmpire Member App">
                <Box
                  component="a"
                  href={getMemberAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#6C63FF',
                    bgcolor: 'rgba(108, 99, 255, 0.12)',
                    border: '1px solid rgba(108, 99, 255, 0.25)',
                    '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.25)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  📱 Member App
                </Box>
              </Tooltip>

              <Tooltip title="Open FitEmpire Gym Partner App">
                <Box
                  component="a"
                  href={getPartnerAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#3B82F6',
                    bgcolor: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.25)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  🏢 FitEmpire Partner App
                </Box>
              </Tooltip>

              <Tooltip title="Return to Main Website">
                <Box
                  component={Link}
                  href="/"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#10B981',
                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.25)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  🌐 Main Website
                </Box>
              </Tooltip>
            </Box>

            <IconButton sx={{ color: 'text.secondary' }}>
              <Search />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={4} color="error">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0D18 100%)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
