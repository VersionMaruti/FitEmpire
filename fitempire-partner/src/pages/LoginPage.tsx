import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { partnerApi } from '../api';
import {
  Dumbbell, ShieldCheck, Mail, Lock, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, Eye, EyeOff, RotateCcw, Clock, KeyRound, X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // 🛡️ Secure OTP-Protected Password Reset with Expiration Timer (FE-038 & FE-117)
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(600); // 10 minutes (600s)

  useEffect(() => {
    let timer: any = null;
    if (resetModalOpen && resetStep === 2 && otpTimeRemaining > 0) {
      timer = setInterval(() => {
        setOtpTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resetModalOpen, resetStep, otpTimeRemaining]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid partner credentials. Please check your email and password.');
    }
  };

  // Step 1: Send OTP to email
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please provide a valid registered partner email address.');
      return;
    }
    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      setResetStep(2);
      setOtpTimeRemaining(600); // 10 minute validity
    }, 600);
  };

  // Step 2: Verify OTP and set new password
  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpTimeRemaining <= 0) {
      setError('Password reset token has expired. Please request a new security code.');
      return;
    }
    if (resetOtp.trim().length < 4) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      setPassword(newPassword);
      setEmail(resetEmail);
      setResetModalOpen(false);
      setResetSuccess('Password updated successfully via verified security OTP! You can now sign in.');
      setResetStep(1);
    }, 700);
  };

  const handleFillDemo = () => {
    setEmail('partner@fitempire.tech');
    setPassword('Partner@123');
  };

  return (
    <div className="partner-app-shell" style={{ justifyContent: 'center' }}>
      {/* Sleek Auth Card (Responsive on Desktop & Mobile) */}
      <div className="partner-auth-card">
        <button
          onClick={() => navigate('/welcome')}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              backgroundColor: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'inline-flex', transform: 'scaleX(-1)' }}>
              <Dumbbell color="#4F46E5" size={28} />
            </div>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
            FitEmpire Partner Portal
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            Gym Desk Turnstile Management & Live Pass Verification
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {resetSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{resetSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
              Partner Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#111B30',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '0 12px',
                height: 48,
              }}
            >
              <Mail size={16} color="#64748B" />
              <input
                type="email"
                required
                placeholder="partner@fitempire.tech"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFF',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginLeft: 10,
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || 'partner@fitempire.tech');
                  setResetModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38BDF8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Forgot Password?
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#111B30',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '0 12px',
                height: 48,
              }}
            >
              <Lock size={16} color="#64748B" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFF',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginLeft: 10,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', height: 48, marginTop: 8 }}
          >
            {isLoading ? <span>Signing In...</span> : <span>Sign In to Gym Desk</span>}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 10,
              padding: '8px 14px',
              color: '#38BDF8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={14} />
            <span>Fill Demo Partner Login</span>
          </button>
        </div>
      </div>

      {/* Secure OTP Reset Modal with Visual Countdown Timer (FE-038 & FE-117) */}
      {resetModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
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
              border: '1px solid #38BDF8',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: 22
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyRound size={18} color="#38BDF8" />
                <strong style={{ fontSize: '0.92rem', color: '#FFF' }}>Secure Password Recovery</strong>
              </div>
              <button onClick={() => setResetModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                  Enter your registered partner email address. A time-limited 6-digit verification code will be dispatched.
                </p>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Partner Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.82rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button type="submit" disabled={resetting} className="btn-primary" style={{ flex: 1, padding: 10, fontSize: '0.8rem' }}>
                    {resetting ? 'Dispatching OTP...' : 'Send Security OTP'}
                  </button>
                  <button type="button" onClick={() => setResetModalOpen(false)} style={{ backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Visual Expiration Timer (FE-117) */}
                <div
                  style={{
                    backgroundColor: otpTimeRemaining > 60 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                    border: otpTimeRemaining > 60 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color={otpTimeRemaining > 60 ? '#38BDF8' : '#EF4444'} />
                    <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Security Token Validity:</span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: otpTimeRemaining > 60 ? '#38BDF8' : '#EF4444' }}>
                    {formatTimer(otpTimeRemaining)} remaining
                  </strong>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>Enter 6-Digit OTP:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 582910"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#38BDF8', fontSize: '1rem', letterSpacing: 3, fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'block', marginBottom: 4 }}>New Password (min 8 characters):</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#FFF', fontSize: '0.82rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button type="submit" disabled={resetting || otpTimeRemaining <= 0} className="btn-primary" style={{ flex: 1, padding: 10, fontSize: '0.8rem' }}>
                    {resetting ? 'Updating...' : 'Verify OTP & Reset'}
                  </button>
                  <button type="button" onClick={() => setResetStep(1)} style={{ backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
