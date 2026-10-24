import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, PartnerRole } from '../context/AuthContext';
import {
  LayoutDashboard,
  QrCode,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Dumbbell,
  Wifi,
  Battery,
  Sparkles,
  Calendar,
  CheckCircle2,
  X,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Bell,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';

export interface CheckInEventData {
  memberName: string;
  phone?: string;
  passTier?: string;
  gymName?: string;
  time?: string;
  bookingId?: string;
}

export const PartnerLayout: React.FC = () => {
  const { user, logout, isAuthenticated, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState('09:41');
  const [activeCheckInAlert, setActiveCheckInAlert] = useState<CheckInEventData | null>(null);
  const [unreadVisitsCount, setUnreadVisitsCount] = useState<number>(3);
  const [isDaylightMode, setIsDaylightMode] = useState<boolean>(() => {
    return localStorage.getItem('fitempire_partner_theme') === 'daylight';
  });

  // 🛡️ Multi-Language Support for Indian Receptionists (FE-104)
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('fitempire_partner_lang') as 'en' | 'hi') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('fitempire_partner_lang', nextLang);
  };

  // 🛡️ Dynamic Notifications Store (FE-108)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Check-in Verified', desc: 'Rahul Sharma scanned QR pass at Gate #1', time: '10 mins ago', read: false },
    { id: '2', title: 'Weekly Payout Initiated', desc: '₹38,400 settlement sent to HDFC Bank A/c', time: '2 hours ago', read: false },
    { id: '3', title: 'KYC Document Approved', desc: 'Trade License & GST verified by Super Admin', time: '1 day ago', read: true },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 🛡️ Idle Session Timeout Warning (FE-101)
  const [idleWarningOpen, setIdleWarningOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(120);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('click', recordActivity);
    window.addEventListener('touchstart', recordActivity);

    // Check idle status every 10 seconds
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      // 28 minutes = 28 * 60 * 1000 = 1,680,000 ms
      const IDLE_LIMIT = 28 * 60 * 1000;
      if (elapsed >= IDLE_LIMIT && !idleWarningOpen) {
        setIdleWarningOpen(true);
        setCountdownSeconds(120);
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      clearInterval(interval);
    };
  }, [idleWarningOpen]);

  // Countdown timer when warning modal is open
  useEffect(() => {
    if (!idleWarningOpen) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [idleWarningOpen, logout]);

  const resetIdleTimer = () => {
    lastActivityRef.current = Date.now();
    setIdleWarningOpen(false);
    setCountdownSeconds(120);
  };

  useEffect(() => {
    if (isDaylightMode) {
      document.body.classList.add('daylight-mode');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('fitempire_partner_theme', 'daylight');
    } else {
      document.body.classList.remove('daylight-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('fitempire_partner_theme', 'dark');
    }
  }, [isDaylightMode]);

  const toggleTheme = () => {
    setIsDaylightMode((prev) => !prev);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Global Check-In Event Listener
  useEffect(() => {
    const handleCheckInEvent = (e: any) => {
      if (e.detail) {
        setActiveCheckInAlert(e.detail);
        setUnreadVisitsCount((c) => c + 1);
        setNotifications((prev) => [
          {
            id: String(Date.now()),
            title: 'Turnstile Verified',
            desc: `${e.detail.memberName} checked in with ${e.detail.passTier}`,
            time: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      }
    };

    window.addEventListener('fitempire_checkin_event', handleCheckInEvent);
    return () => window.removeEventListener('fitempire_checkin_event', handleCheckInEvent);
  }, []);

  // i18n Label Dictionaries (FE-104)
  const labels = {
    en: {
      desk: 'Desk',
      visits: 'Visits',
      scanner: 'Scanner',
      classes: 'Classes',
      payouts: 'Payouts',
      gym: 'Gym Profile',
      scanQr: 'Scan QR',
      role: 'Role',
      notifications: 'Notifications',
      markAllRead: 'Mark all read',
      idleTitle: 'Reception Desk Inactivity Warning',
      idleDesc: 'For front-desk security compliance, this session will lock in',
      stayLoggedIn: 'Stay Logged In',
      lockNow: 'Lock Desk Now'
    },
    hi: {
      desk: 'मुख्य डेस्क',
      visits: 'उपस्थिति',
      scanner: 'स्कैनर',
      classes: 'बैच / कक्षाएं',
      payouts: 'राजस्व भुगतान',
      gym: 'जिम प्रोफाइल',
      scanQr: 'क्यूआर स्कैन',
      role: 'भूमिका',
      notifications: 'सूचनाएं',
      markAllRead: 'सब पढ़ी हुई मार्क करें',
      idleTitle: 'डेस्क निष्क्रियता चेतावनी',
      idleDesc: 'सुरक्षा कारणों से यह सत्र लॉक हो जाएगा',
      stayLoggedIn: 'लॉग इन रहें',
      lockNow: 'तुरंत लॉक करें'
    }
  }[language];

  // RBAC Tab Filtering (FE-112)
  const allTabs = [
    { label: labels.desk, path: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'FRONT_DESK'] },
    { label: labels.visits, path: '/attendance', icon: Users, badge: unreadVisitsCount, roles: ['OWNER', 'FRONT_DESK', 'TRAINER'] },
    { label: labels.scanner, path: '/scanner', icon: QrCode, isProminent: true, roles: ['OWNER', 'FRONT_DESK'] },
    { label: labels.classes, path: '/classes', icon: Calendar, roles: ['OWNER', 'FRONT_DESK', 'TRAINER'] },
    { label: labels.payouts, path: '/settlements', icon: DollarSign, roles: ['OWNER'] }, // Financial data locked from junior staff
    { label: labels.gym, path: '/profile', icon: Settings, roles: ['OWNER', 'FRONT_DESK'] },
  ];

  const visibleTabs = allTabs.filter((t) => t.roles.includes(activeRole));

  return (
    <div className="partner-app-shell">
      {/* Responsive Dashboard Container */}
      <div className="partner-device-frame">
        {/* Top Status Bar (Visible only on mobile) */}
        <div className="partner-mobile-status-bar">
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em' }}>
            {currentTime}
          </span>

          <div
            style={{
              width: 110,
              height: 22,
              borderRadius: 20,
              backgroundColor: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#A5B4FC' }}>GATE #1 OPEN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
            <Wifi size={12} color="#10B981" />
            <Battery size={13} color="#FFF" />
          </div>
        </div>

        {/* Global Desktop & Tablet Header */}
        <header className="partner-desktop-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
              }}
            >
              <Dumbbell size={18} color="#FFF" />
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em', display: 'block' }}>
                FitEmpire <span style={{ color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700 }}>PARTNER</span>
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                {user?.gymName || 'FitEmpire Flagship'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="partner-desktop-nav-links">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: isActive ? '#38BDF8' : '#94A3B8',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && !isActive && (
                    <span
                      style={{
                        backgroundColor: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        borderRadius: 10,
                        padding: '1px 5px',
                        marginLeft: 2,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* RBAC Role Selector (FE-112) */}
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as PartnerRole)}
              title="Role-Based Access Control Mode"
              style={{
                height: 28,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#38BDF8',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0 6px',
                cursor: 'pointer'
              }}
            >
              <option value="OWNER" style={{ background: '#0F172A', color: '#FFF' }}>Owner (All)</option>
              <option value="FRONT_DESK" style={{ background: '#0F172A', color: '#FFF' }}>Front Desk Staff</option>
              <option value="TRAINER" style={{ background: '#0F172A', color: '#FFF' }}>Trainer</option>
            </select>

            {/* Language Switcher EN / HI (FE-104) */}
            <button
              onClick={toggleLanguage}
              title="Toggle English / Hindi interface"
              style={{
                height: 28,
                padding: '0 8px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: 800
              }}
            >
              <Globe size={12} color="#38BDF8" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Notifications Bell Dropdown (FE-108) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={13} color={unreadNotificationsCount > 0 ? '#38BDF8' : '#94A3B8'} />
                {unreadNotificationsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#EF4444'
                    }}
                  />
                )}
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 36,
                    right: 0,
                    width: 280,
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
                    zIndex: 200,
                    padding: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #1E293B', paddingBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFF' }}>{labels.notifications}</span>
                    <button
                      onClick={markAllNotificationsRead}
                      style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {labels.markAllRead}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          backgroundColor: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(56, 189, 248, 0.08)',
                          borderRadius: 8,
                          padding: '6px 8px',
                          border: n.read ? 'none' : '1px solid rgba(56, 189, 248, 0.2)'
                        }}
                      >
                        <strong style={{ fontSize: '0.72rem', color: '#FFF', display: 'block' }}>{n.title}</strong>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>{n.desc}</span>
                        <span style={{ fontSize: '0.58rem', color: '#64748B', display: 'block', marginTop: 2 }}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daylight / Anti-Glare Mode Toggle (FE-120) */}
            <button
              onClick={toggleTheme}
              title={isDaylightMode ? "Switch to Dark Neon Mode" : "Switch to Daylight High-Contrast Mode (Anti-Glare)"}
              style={{
                height: 28,
                padding: '0 8px',
                borderRadius: 8,
                background: isDaylightMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                border: isDaylightMode ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isDaylightMode ? '#D97706' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              {isDaylightMode ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} color="#A5B4FC" />}
              <span style={{ fontSize: '0.68rem' }}>{isDaylightMode ? 'Daylight' : 'Dark'}</span>
            </button>

            <button
              onClick={() => navigate('/scanner')}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                color: '#FFF',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
              }}
            >
              <QrCode size={13} />
              <span>{labels.scanQr}</span>
            </button>

            <button
              onClick={logout}
              title="Logout"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Global Live Check-in Popup Alert */}
        {activeCheckInAlert && (
          <div
            className="animate-popin"
            style={{
              position: 'absolute',
              top: 50,
              left: 12,
              right: 12,
              zIndex: 100,
              backgroundColor: '#0F172A',
              border: '2px solid #10B981',
              borderRadius: 18,
              padding: '14px 16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={18} color="#10B981" />
                </div>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10B981' }}>
                    Member QR Check-in Approved!
                  </span>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#94A3B8' }}>
                    Synced with FitEmpire DB & Admin Console
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveCheckInAlert(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#FFF' }}>{activeCheckInAlert.memberName}</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#38BDF8' }}>
                  {activeCheckInAlert.passTier || 'FitEmpire All-Access Gold'}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 700 }}>
                {activeCheckInAlert.time || 'Just now'}
              </span>
            </div>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="partner-app-content">
          <Outlet />
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="partner-mobile-bottom-nav">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) => `partner-nav-tab ${isActive ? 'active' : ''} ${tab.isProminent ? 'prominent' : ''}`}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={tab.isProminent ? 22 : 19} />
                  {tab.badge && tab.badge > 0 && !isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -6,
                        backgroundColor: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        borderRadius: 10,
                        padding: '1px 4px',
                        lineHeight: 1,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Idle Session Warning Modal (FE-101) */}
      {idleWarningOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#0F172A',
              border: '2px solid #F59E0B',
              borderRadius: 20,
              maxWidth: 420,
              width: '100%',
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.9)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <AlertTriangle size={26} color="#F59E0B" />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF', marginBottom: 6 }}>
              {labels.idleTitle}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 16 }}>
              {labels.idleDesc}{' '}
              <strong style={{ color: '#F59E0B', fontSize: '0.95rem' }}>{countdownSeconds}s</strong>
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={resetIdleTimer}
                className="btn-primary"
                style={{ flex: 1, padding: 12, fontSize: '0.82rem', fontWeight: 700 }}
              >
                {labels.stayLoggedIn}
              </button>
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#334155',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {labels.lockNow}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
