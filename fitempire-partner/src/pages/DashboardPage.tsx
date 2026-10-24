import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  QrCode,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Flame,
  Dumbbell,
  ArrowDownRight
} from 'lucide-react';
import { partnerApi } from '../api';

type ComparisonPeriod = 'TODAY' | 'WEEK' | 'MONTH';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ComparisonPeriod>('TODAY');

  const [stats, setStats] = useState({
    checkedInToday: 6,
    todayEarnings: 1200,
    activePassHolders: 48,
    rating: 4.9,
  });

  // Dynamic Metrics by Comparison Period (FE-115)
  const periodMetrics = {
    TODAY: {
      visits: stats.checkedInToday,
      visitsDiff: '+18.2%',
      isVisitsPositive: true,
      visitsVsText: 'vs yesterday (5 visits)',
      revenue: stats.todayEarnings,
      revenueDiff: '+15.0%',
      isRevenuePositive: true,
      revenueVsText: 'vs yesterday (₹1,000)',
      members: stats.activePassHolders,
      membersText: '+3 new members today',
    },
    WEEK: {
      visits: stats.checkedInToday * 6 + 14,
      visitsDiff: '+24.5%',
      isVisitsPositive: true,
      visitsVsText: 'vs last week (40 visits)',
      revenue: stats.todayEarnings * 6 + 2800,
      revenueDiff: '+22.1%',
      isRevenuePositive: true,
      revenueVsText: 'vs last week (₹8,200)',
      members: stats.activePassHolders + 6,
      membersText: '+11 new members this week',
    },
    MONTH: {
      visits: 214,
      visitsDiff: '+31.4%',
      isVisitsPositive: true,
      visitsVsText: 'vs last month (163 visits)',
      revenue: 42800,
      revenueDiff: '+29.8%',
      isRevenuePositive: true,
      revenueVsText: 'vs last month (₹32,900)',
      members: 94,
      membersText: '+28 new monthly subscriptions',
    },
  }[period];

  const [recentCheckIns, setRecentCheckIns] = useState<Array<{
    id: string;
    name: string;
    time: string;
    tier: string;
    status: string;
  }>>([
    { id: '1', name: 'Rahul Sharma', time: '10:45 PM', tier: 'FitEmpire Gold Elite', status: 'VERIFIED' },
    { id: '2', name: 'Priya Patel', time: '10:12 PM', tier: 'FitEmpire Platinum VIP', status: 'VERIFIED' },
    { id: '3', name: 'Amit Kumar', time: '09:30 PM', tier: 'FitEmpire Pro Unlimited', status: 'VERIFIED' },
  ]);

  const [todayClasses, setTodayClasses] = useState<Array<{
    id: string;
    name: string;
    trainer: string;
    time: string;
    booked: number;
    capacity: number;
  }>>([
    { id: '1', name: 'High-Intensity HIIT', trainer: 'Marcus Ray', time: '07:00 PM', booked: 18, capacity: 20 },
    { id: '2', name: 'Power Yoga & Core', trainer: 'Sarah Chen', time: '08:15 PM', booked: 14, capacity: 15 },
  ]);

  useEffect(() => {
    partnerApi.getDashboardStats()
      .then((res) => {
        const d = res.data?.data;
        if (d) {
          const bookings = Number(d.totalBookingsToday) || 6;
          setStats({
            checkedInToday: bookings,
            todayEarnings: bookings * 200,
            activePassHolders: Number(d.totalUsers) || 48,
            rating: 4.9,
          });
        }
      })
      .catch(() => {});

    partnerApi.getAttendances()
      .then((res) => {
        const list = res.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setRecentCheckIns(list.slice(0, 3).map((item: any, idx: number) => ({
            id: item.id || String(idx),
            name: item.name || 'FitEmpire Member',
            time: item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            tier: item.passType || 'FitEmpire All-Access Gold',
            status: 'VERIFIED',
          })));
        }
      })
      .catch(() => {});

    const handleCheckIn = (e: any) => {
      if (e.detail) {
        setStats((prev) => ({
          ...prev,
          checkedInToday: prev.checkedInToday + 1,
          todayEarnings: prev.todayEarnings + 200,
        }));

        setRecentCheckIns((prev) => [
          {
            id: String(Date.now()),
            name: e.detail.memberName || 'FitEmpire Member',
            time: 'Just now',
            tier: e.detail.passTier || 'FitEmpire All-Access Gold',
            status: 'VERIFIED',
          },
          ...prev.slice(0, 4),
        ]);
      }
    };

    window.addEventListener('fitempire_checkin_event', handleCheckIn);
    return () => window.removeEventListener('fitempire_checkin_event', handleCheckIn);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Fast Pass Verification Action Card */}
      <div
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.4)',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.5)',
            }}
          >
            <QrCode size={20} color="#FFF" />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFF', display: 'block' }}>
              Verify Member Pass
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
              Instant QR camera & fast-scan simulator
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/scanner')}
          className="btn-primary"
          style={{ padding: '8px 12px', fontSize: '0.75rem' }}
        >
          <span>Open Scanner</span>
        </button>
      </div>

      {/* Date Comparison Period Selector (FE-115) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFF' }}>
          Performance Growth & Analytics
        </span>

        <div style={{ display: 'flex', gap: 4, backgroundColor: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 8 }}>
          {[
            { label: 'Today', value: 'TODAY' as const },
            { label: 'This Week', value: 'WEEK' as const },
            { label: 'This Month', value: 'MONTH' as const },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPeriod(btn.value)}
              style={{
                backgroundColor: period === btn.value ? '#3B82F6' : 'transparent',
                color: period === btn.value ? '#FFF' : '#94A3B8',
                border: 'none',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2x2 Metric Cards Grid with Previous Period Comparison (FE-115) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Visits Card */}
        <div className="glass-panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>
              {period === 'TODAY' ? "TODAY'S VISITS" : period === 'WEEK' ? 'WEEKLY VISITS' : 'MONTHLY VISITS'}
            </span>
            <div style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={13} color="#38BDF8" />
            </div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF', display: 'block' }}>
            {periodMetrics.visits}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 800 }}>
              {periodMetrics.visitsDiff}
            </span>
            <span style={{ fontSize: '0.58rem', color: '#64748B' }}>
              {periodMetrics.visitsVsText}
            </span>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="glass-panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>
              {period === 'TODAY' ? 'TODAY EARNINGS' : period === 'WEEK' ? 'WEEK REVENUE' : 'MONTH REVENUE'}
            </span>
            <div style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={13} color="#10B981" />
            </div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10B981', display: 'block' }}>
            ₹{periodMetrics.revenue.toLocaleString('en-IN')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 800 }}>
              {periodMetrics.revenueDiff}
            </span>
            <span style={{ fontSize: '0.58rem', color: '#64748B' }}>
              {periodMetrics.revenueVsText}
            </span>
          </div>
        </div>

        {/* Active Members Card */}
        <div className="glass-panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>PASS HOLDERS</span>
            <div style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={13} color="#A78BFA" />
            </div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF', display: 'block' }}>
            {periodMetrics.members}
          </span>
          <span style={{ fontSize: '0.58rem', color: '#38BDF8', fontWeight: 700, display: 'block', marginTop: 3 }}>
            {periodMetrics.membersText}
          </span>
        </div>

        {/* Rating Card */}
        <div className="glass-panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>GYM RATING</span>
            <div style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color="#FBBF24" />
            </div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FBBF24', display: 'block' }}>
            4.9 / 5.0
          </span>
          <span style={{ fontSize: '0.58rem', color: '#10B981', fontWeight: 700, display: 'block', marginTop: 3 }}>
            Top 2% Partner Gym in Koramangala
          </span>
        </div>
      </div>

      {/* Live Check-ins Feed */}
      <div className="glass-panel" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFF' }}>
            Live Reception Desk Check-Ins
          </span>
          <button
            onClick={() => navigate('/attendance')}
            style={{
              background: 'none',
              border: 'none',
              color: '#38BDF8',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span>View All</span>
            <ArrowUpRight size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recentCheckIns.map((ci) => (
            <div
              key={ci.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                >
                  {ci.name[0]}
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF', display: 'block' }}>
                    {ci.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{ci.tier}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#A5B4FC', fontWeight: 600, display: 'block' }}>
                  {ci.time}
                </span>
                <span className="badge-emerald" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
