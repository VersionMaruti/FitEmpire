import React, { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, User, CheckCircle2, X, Users,
  ChevronRight, Check, AlertTriangle, ShieldCheck, UserCheck
} from 'lucide-react';

interface ClassMember {
  id: string;
  name: string;
  phone: string;
  attended: boolean;
  corporateCompany?: string;
}

interface ClassItem {
  id: string;
  name: string;
  trainer: string;
  time: string;
  capacity: number;
  booked: number;
  room: string;
  members: ClassMember[];
}

const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'High-Intensity CrossFit',
    trainer: 'Coach Vikram',
    time: '06:30 PM',
    capacity: 20,
    booked: 18,
    room: 'Studio 1',
    members: [
      { id: 'm1', name: 'Rahul Sharma', phone: '+91 98800 72520', attended: true },
      { id: 'm2', name: 'Priya Patel', phone: '+91 98765 43210', attended: true },
      { id: 'm3', name: 'Amit Kumar', phone: '+91 94104 30095', attended: false, corporateCompany: 'Infosys' },
      { id: 'm4', name: 'Sneha Verma', phone: '+91 94567 81234', attended: false, corporateCompany: 'Wipro' },
    ],
  },
  {
    id: 'cls-2',
    name: 'Power Yoga & Core',
    trainer: 'Sarah Chen',
    time: '07:30 PM',
    capacity: 15,
    booked: 15, // At capacity (FE-116)
    room: 'Studio 2',
    members: [
      { id: 'm5', name: 'Ananya Roy', phone: '+91 95432 19876', attended: true },
      { id: 'm6', name: 'Kavita Singh', phone: '+91 97654 32190', attended: true },
      { id: 'm7', name: 'Pooja Hegde', phone: '+91 98111 22334', attended: false },
    ],
  },
  {
    id: 'cls-3',
    name: 'Zumba Cardio Blast (Corporate Special)',
    trainer: 'Pooja Hegde',
    time: '08:30 PM',
    capacity: 25,
    booked: 22,
    room: 'Studio 1',
    members: [
      { id: 'm8', name: 'Rohan Gupta', phone: '+91 96543 21987', attended: false, corporateCompany: 'TCS Batch' },
      { id: 'm9', name: 'Deepak Joshi', phone: '+91 94321 98765', attended: false, corporateCompany: 'TCS Batch' },
      { id: 'm10', name: 'Megha Rastogi', phone: '+91 93322 11000', attended: false, corporateCompany: 'TCS Batch' },
      { id: 'm11', name: 'Karan Mehra', phone: '+91 92211 00998', attended: false, corporateCompany: 'TCS Batch' },
    ],
  },
];

export const ClassesPage: React.FC = () => {
  // 🛡️ Persistent Classes Store (FE-032)
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('fitempire_partner_classes_data');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ClassItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [trainer, setTrainer] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [room, setRoom] = useState('Studio 1');

  // Persist state updates (FE-032)
  useEffect(() => {
    localStorage.setItem('fitempire_partner_classes_data', JSON.stringify(classes));
  }, [classes]);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !trainer || !time) return;
    const newClass: ClassItem = {
      id: 'cls-' + Date.now().toString().slice(-4),
      name,
      trainer,
      time,
      capacity: Number(capacity) || 20,
      booked: 0,
      room,
      members: [],
    };
    const updated = [newClass, ...classes];
    setClasses(updated);
    setModalOpen(false);
    setName('');
    setTrainer('');
    setTime('');
  };

  const toggleMemberAttended = (classId: string, memberId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const updatedMembers = c.members.map((m) =>
            m.id === memberId ? { ...m, attended: !m.attended } : m
          );
          const updated = { ...c, members: updatedMembers };
          if (selectedBatch?.id === classId) {
            setSelectedBatch(updated);
          }
          return updated;
        }
        return c;
      })
    );
  };

  // 🛡️ Bulk Check-in for Group / Corporate Batches (FE-110)
  const handleBulkCheckInAll = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const updatedMembers = c.members.map((m) => ({ ...m, attended: true }));
          const updated = { ...c, members: updatedMembers };
          if (selectedBatch?.id === classId) {
            setSelectedBatch(updated);
          }
          return updated;
        }
        return c;
      })
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>
            Class Schedules & Batch Turnstile
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
            Live studio capacity monitoring, bulk group check-in & roster management
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.72rem' }}
        >
          <Plus size={14} />
          <span>Add Batch Schedule</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {classes.map((cls) => {
          const activeAttendedCount = cls.members.filter((m) => m.attended).length;
          // FE-116: Check studio overcrowding
          const isAtMaxCapacity = cls.booked >= cls.capacity || activeAttendedCount >= cls.capacity;

          return (
            <div
              key={cls.id}
              className="glass-panel"
              style={{
                padding: 14,
                border: isAtMaxCapacity ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: isAtMaxCapacity ? 'rgba(239, 68, 68, 0.04)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.92rem', color: '#FFF' }}>{cls.name}</strong>
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                      {cls.room}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginTop: 2 }}>
                    Trainer: <strong style={{ color: '#E2E8F0' }}>{cls.trainer}</strong> • Time: <strong style={{ color: '#A5B4FC' }}>{cls.time}</strong>
                  </span>
                </div>

                {/* Capacity Counter & Warning (FE-116) */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <Users size={13} color={isAtMaxCapacity ? '#EF4444' : '#10B981'} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isAtMaxCapacity ? '#EF4444' : '#10B981' }}>
                      {activeAttendedCount} Present / {cls.capacity} Cap
                    </span>
                  </div>
                  {isAtMaxCapacity && (
                    <span style={{ fontSize: '0.62rem', color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <AlertTriangle size={10} /> Max Capacity Reached
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Bulk Check-In & Details (FE-110) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleBulkCheckInAll(cls.id)}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34D399',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Check-in all pre-booked members in one click"
                  >
                    <UserCheck size={12} />
                    <span>Bulk Check-In All ({cls.members.length})</span>
                  </button>

                  <button
                    onClick={() => setSelectedBatch(cls)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#38BDF8',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>View Roster ({cls.members.length})</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                  {cls.members.filter((m) => !m.attended).length} Pending Arrival
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roster & Attendance Inspection Drawer */}
      {selectedBatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #3B82F6',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: 20
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#FFF' }}>{selectedBatch.name}</strong>
                <span style={{ fontSize: '0.7rem', color: '#38BDF8', display: 'block' }}>
                  {selectedBatch.time} • Trainer: {selectedBatch.trainer}
                </span>
              </div>
              <button onClick={() => setSelectedBatch(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
                BATCH ROSTER ATTENDEES ({selectedBatch.members.length})
              </span>
              <button
                onClick={() => handleBulkCheckInAll(selectedBatch.id)}
                style={{
                  backgroundColor: '#10B981',
                  color: '#000',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ✓ Mark All Checked-in
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {selectedBatch.members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF', display: 'block' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                      {m.phone} {m.corporateCompany ? `• 🏢 ${m.corporateCompany}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleMemberAttended(selectedBatch.id, m.id)}
                    style={{
                      backgroundColor: m.attended ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                      border: m.attended ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.15)',
                      color: m.attended ? '#10B981' : '#94A3B8',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {m.attended ? <Check size={12} /> : null}
                    <span>{m.attended ? 'Checked In' : 'Tap to Check In'}</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedBatch(null)}
              className="btn-primary"
              style={{ width: '100%', marginTop: 14, padding: 10, fontSize: '0.78rem' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #7C3AED',
              borderRadius: 16,
              maxWidth: 400,
              width: '100%',
              padding: 20
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: '0.9rem', color: '#FFF' }}>Create Workout Batch</strong>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Class Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boxing Sparring Workshop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Trainer Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Vikram"
                  value={trainer}
                  onChange={(e) => setTrainer(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Time:</label>
                  <input
                    type="text"
                    required
                    placeholder="07:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Max Capacity:</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: 10, fontSize: '0.78rem' }}>
                  Save & Publish Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
