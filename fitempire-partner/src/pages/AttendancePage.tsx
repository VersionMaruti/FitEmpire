import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  User,
  Clock,
  ShieldCheck,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { partnerApi } from '../api';

interface AttendanceRecord {
  id: string;
  name: string;
  phone: string;
  passType: string;
  time: string;
  date: string;
  status: string;
  recordedBy?: string;
  overrideReason?: string;
}

export const AttendancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Manual Check-in Override Modal (FE-105)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideName, setOverrideName] = useState('');
  const [overridePhone, setOverridePhone] = useState('');
  const [overrideReason, setOverrideReason] = useState('Camera Glare / Damaged Screen');
  const [staffName, setStaffName] = useState('Front Desk Receptionist (Pooja)');

  const [records, setRecords] = useState<AttendanceRecord[]>([
    { id: 'REC-101', name: 'Rahul Sharma', phone: '+91 98800 72520', passType: 'FitEmpire Gold Elite', time: '10:45 PM', date: 'Today', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
    { id: 'REC-102', name: 'Priya Patel', phone: '+91 98765 43210', passType: 'FitEmpire Platinum VIP', time: '10:12 PM', date: 'Today', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
    { id: 'REC-103', name: 'Amit Kumar', phone: '+91 94104 30095', passType: 'FitEmpire Pro Unlimited', time: '09:30 PM', date: 'Today', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #2' },
    { id: 'REC-104', name: 'Sneha Verma', phone: '+91 94567 81234', passType: 'FitEmpire Gold Elite', time: '08:50 PM', date: 'Today', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
    { id: 'REC-105', name: 'Vikram Malhotra', phone: '+91 99123 45678', passType: 'FitEmpire All-Access', time: '07:15 PM', date: 'Yesterday', status: 'CHECKED_IN', recordedBy: 'Staff Override (Pooja)', overrideReason: 'Phone Battery Died' },
    { id: 'REC-106', name: 'Ananya Deshmukh', phone: '+91 98222 33445', passType: 'FitEmpire Platinum VIP', time: '06:40 PM', date: 'Yesterday', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
    { id: 'REC-107', name: 'Rohan Mehta', phone: '+91 97333 44556', passType: 'FitEmpire Gold Elite', time: '05:20 PM', date: 'This Week', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
    { id: 'REC-108', name: 'Kavita Nair', phone: '+91 96444 55667', passType: 'FitEmpire Pro Unlimited', time: '04:10 PM', date: 'This Week', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #2' },
    { id: 'REC-109', name: 'Deepak Chopra', phone: '+91 95555 66778', passType: 'FitEmpire All-Access', time: '03:00 PM', date: 'This Month', status: 'CHECKED_IN', recordedBy: 'Turnstile Scanner #1' },
  ]);

  const loadAttendances = async () => {
    setLoading(true);
    try {
      const res = await partnerApi.getAttendances();
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        const formatted: AttendanceRecord[] = data.map((d: any, idx: number) => ({
          id: d.id || `REC-${110 + idx}`,
          name: d.name || 'FitEmpire Member',
          phone: d.phone || '+91 98800 72520',
          passType: d.passType || 'FitEmpire All-Access Gold',
          time: d.time ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          date: d.date || 'Today',
          status: d.status || 'CHECKED_IN',
          recordedBy: d.recordedBy || 'Turnstile Scanner #1',
        }));
        setRecords(formatted);
      }
    } catch (e) {
      console.warn('Could not fetch attendances:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();

    // 1. Listen for local window events
    const handleNewCheckIn = (e: any) => {
      if (e.detail) {
        const newRecord: AttendanceRecord = {
          id: 'REC-' + Date.now().toString().slice(-4),
          name: e.detail.memberName || 'FitEmpire Member',
          phone: e.detail.phone || '+91 98800 72520',
          passType: e.detail.passTier || 'FitEmpire All-Access Gold',
          time: 'Just now',
          date: 'Today',
          status: 'CHECKED_IN',
          recordedBy: e.detail.overrideBy || 'Turnstile Scanner',
          overrideReason: e.detail.overrideReason,
        };
        setRecords((prev) => [newRecord, ...prev]);
      }
    };
    window.addEventListener('fitempire_checkin_event', handleNewCheckIn);

    // 2. BroadcastChannel for Real-Time Multi-Terminal Desk Sync (FE-031)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('fitempire_turnstile_channel');
      bc.onmessage = (msgEvent) => {
        if (msgEvent.data?.type === 'CHECKIN_SYNC' && msgEvent.data.payload) {
          const payload = msgEvent.data.payload;
          const syncedRecord: AttendanceRecord = {
            id: 'SYNC-' + Date.now().toString().slice(-4),
            name: payload.memberName,
            phone: payload.phone,
            passType: payload.passTier,
            time: payload.time || 'Just now',
            date: 'Today',
            status: 'CHECKED_IN',
            recordedBy: payload.overrideBy || 'Remote Terminal Gate',
          };
          setRecords((prev) => [syncedRecord, ...prev]);
        }
      };
    }

    return () => {
      window.removeEventListener('fitempire_checkin_event', handleNewCheckIn);
      if (bc) bc.close();
    };
  }, []);

  // 🛡️ FE-107: Flexible partial phone search (e.g. "7252" matches "+91 98800 72520")
  const filtered = records.filter((r) => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanPhone = r.phone.replace(/\D/g, '');
    const cleanQueryDigits = cleanSearch.replace(/\D/g, '');

    const matchesName = r.name.toLowerCase().includes(cleanSearch);
    const matchesTier = r.passType.toLowerCase().includes(cleanSearch);
    const matchesId = r.id.toLowerCase().includes(cleanSearch);
    const matchesPhone = cleanQueryDigits.length > 0 && cleanPhone.includes(cleanQueryDigits);

    const matchesSearch = cleanSearch === '' || matchesName || matchesTier || matchesId || matchesPhone;

    // FE-113: Date range filter
    let matchesDate = true;
    if (dateRange === 'TODAY') matchesDate = r.date === 'Today';
    else if (dateRange === 'YESTERDAY') matchesDate = r.date === 'Yesterday';
    else if (dateRange === 'WEEK') matchesDate = r.date === 'Today' || r.date === 'Yesterday' || r.date === 'This Week';
    else if (dateRange === 'MONTH') matchesDate = true;
    else if (dateRange === 'ALL') matchesDate = true;

    return matchesSearch && matchesDate;
  });

  // FE-103: Virtualized Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 🛡️ FE-113 & FE-114: Date-range filtered CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Visit ID',
      'Member Name',
      'Phone Number',
      'Pass Tier',
      'Check-in Time',
      'Date Filter',
      'Status',
      'Verified By / Staff Identity',
      'Override Reason'
    ];

    const rows = filtered.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${r.passType.replace(/"/g, '""')}"`,
      `"${r.time}"`,
      `"${r.date}"`,
      `"${r.status}"`,
      `"${(r.recordedBy || 'Turnstile Gate').replace(/"/g, '""')}"`,
      `"${(r.overrideReason || 'N/A').replace(/"/g, '""')}"`,
    ].join(','));

    // UTF-8 BOM (\uFEFF)
    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fitempire_attendance_${dateRange.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 🛡️ FE-105: Staff Manual Check-in Override Handler
  const handleManualOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideName || !overridePhone) return;

    const newOverride: AttendanceRecord = {
      id: 'OVR-' + Date.now().toString().slice(-4),
      name: overrideName.trim(),
      phone: overridePhone.trim(),
      passType: 'FitEmpire Gold Elite (Manual Override)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      status: 'CHECKED_IN',
      recordedBy: staffName,
      overrideReason: overrideReason,
    };

    setRecords((prev) => [newOverride, ...prev]);
    setOverrideModalOpen(false);
    setOverrideName('');
    setOverridePhone('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>
            Live Member Visits & Turnstile Attendance
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
            Real-time check-in timestamps, staff audit logs & multi-desk sync
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Manual Staff Override Button (FE-105) */}
          <button
            onClick={() => setOverrideModalOpen(true)}
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              color: '#A78BFA',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <UserCheck size={13} />
            <span>Manual Staff Override</span>
          </button>

          {/* Export CSV with BOM & Date Range Filter (FE-113 & FE-114) */}
          <button
            onClick={handleExportCSV}
            title="Export filtered records with UTF-8 BOM encoding for Microsoft Excel"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={13} />
            <span>Export CSV ({dateRange})</span>
          </button>

          <button
            onClick={loadAttendances}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#38BDF8',
              borderRadius: 10,
              padding: '6px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Selector (FE-113) */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { label: "Today's Visits", value: 'TODAY' as const },
          { label: 'Yesterday', value: 'YESTERDAY' as const },
          { label: 'This Week', value: 'WEEK' as const },
          { label: 'This Month', value: 'MONTH' as const },
          { label: 'All History', value: 'ALL' as const },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => {
              setDateRange(btn.value);
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: dateRange === btn.value ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: dateRange === btn.value ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
              color: dateRange === btn.value ? '#60A5FA' : '#94A3B8',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Search Bar with Partial Search Support (FE-107) */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Search size={16} color="#64748B" />
        <input
          type="text"
          placeholder="Search by name, last 4 digits of phone (e.g. 7252), or pass ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Live Visits Count & Broadcast Channel Badge (FE-031) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
          SHOWING {paginatedRecords.length} OF {filtered.length} MATCHING VISITS
        </span>
        <span className="badge-emerald" style={{ fontSize: '0.62rem' }}>
          ● LIVE BROADCAST DESK SYNC
        </span>
      </div>

      {/* Attendance Cards List (FE-103: Paginated) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {paginatedRecords.length === 0 ? (
          <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
            No attendance visits found matching your filters.
          </div>
        ) : (
          paginatedRecords.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: item.overrideReason
                      ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                      : 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#FFF',
                    fontSize: '0.85rem',
                  }}
                >
                  {item.name[0]}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>({item.phone})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600 }}>
                      {item.passType}
                    </span>
                    {item.recordedBy && (
                      <span style={{ fontSize: '0.62rem', color: '#A78BFA' }}>
                        • Auth: {item.recordedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <Clock size={11} color="#A5B4FC" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#A5B4FC' }}>
                    {item.time} ({item.date})
                  </span>
                </div>
                <span
                  className={item.overrideReason ? 'badge-purple' : 'badge-emerald'}
                  style={{ fontSize: '0.58rem', padding: '1px 5px', marginTop: 2 }}
                >
                  {item.overrideReason ? '⚡ STAFF OVERRIDE' : '✓ TURNSTILE SCANNED'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls (FE-103) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: currentPage === 1 ? '#475569' : '#FFF',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.72rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: currentPage === totalPages ? '#475569' : '#FFF',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.72rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Staff Manual Override Modal (FE-105: Audit Log) */}
      {overrideModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
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
              border: '1px solid #7C3AED',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: 20
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: '0.9rem', color: '#FFF' }}>Manual Attendance Override</strong>
              <button onClick={() => setOverrideModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualOverrideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Required for internal audit compliance. Recorded staff credentials will be logged with this override entry.
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Member Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={overrideName}
                  onChange={(e) => setOverrideName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Member Phone Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98800 00000"
                  value={overridePhone}
                  onChange={(e) => setOverridePhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Override Reason:</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                >
                  <option value="Camera Glare / Damaged Screen">Camera Glare / Damaged Screen</option>
                  <option value="Phone Battery Died">Phone Battery Died</option>
                  <option value="VIP Corporate Guest Pass">VIP Corporate Guest Pass</option>
                  <option value="Turnstile Scanner Hardware Network Glitch">Turnstile Scanner Hardware Network Glitch</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Logging Staff Member Identity:</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#A78BFA', fontSize: '0.8rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: 10, fontSize: '0.78rem' }}>
                  Authorize & Record Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  style={{ backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
