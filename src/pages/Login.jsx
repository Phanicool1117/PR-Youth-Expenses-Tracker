import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Member Login Submission
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    if (!usernameOrId.trim() || !password) {
      setError('Please enter your User ID and Password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(usernameOrId.trim(), password);
      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();
      } else {
        setError(res.message || 'Invalid User ID or Password.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Dedicated Admin Login Submission (Only Password Required)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    if (!adminPassword.trim()) {
      setError('Please enter the Admin security password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login('ADMIN', adminPassword.trim());
      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();
      } else {
        setError(res.message || 'Incorrect Admin Password.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dcebfa] via-[#edf5fc] to-[#f5f9fd] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto my-auto py-6">
        
        {/* Glassmorphic Auth Card */}
        <div className="bg-gradient-to-b from-[#ebf5ff] via-white to-white border border-white/90 rounded-[28px] p-7 sm:p-9 shadow-2xl shadow-blue-500/10 backdrop-blur-md space-y-6">
          
          {/* Top Logo */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <img
                src="/Logo.png"
                alt="Penumuli Perantalamma Youth Logo"
                className="w-28 h-28 object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight leading-snug">
              Committee Expenses Tracker
            </h1>
            <p className="text-xs text-[#64748b] font-medium mt-1 max-w-xs mx-auto leading-relaxed">
              Penumuli Perantalamma Youth Team
            </p>
          </div>

          {/* Error Feedback Toast */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. ADMIN DEDICATED PASSWORD LOGIN VIEW                                    */}
          {/* ========================================================================= */}
          {isAdminMode ? (
            <div className="space-y-4 pt-1 animate-fade-in">
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-rose-950">Executive Admin Access</h3>
                    <p className="text-[10.5px] font-medium text-rose-600">Password Authentication Only</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setIsAdminMode(false);
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-100/60 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Member</span>
                </button>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1">
                {/* Admin Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Admin Password
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-4 w-4 h-4 text-rose-500 pointer-events-none z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password..."
                      className="w-full bg-[#f1f5f9] border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      autoComplete="current-password"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Admin Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccessState}
                  className={`w-full py-3.5 rounded-2xl shadow-md transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer ${
                    isSuccessState
                      ? 'bg-emerald-600 text-white scale-[1.02] shadow-emerald-500/25'
                      : isSubmitting
                      ? 'bg-rose-600 text-white cursor-wait'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                  }`}
                >
                  {isSubmitting && !isSuccessState ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : isSuccessState ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Login to Admin Portal</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setIsAdminMode(false);
                      setError('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#0f172a] transition-colors cursor-pointer"
                  >
                    ← Back to Member Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. STANDARD MEMBER LOGIN VIEW (With Red Admin Button Below)               */
            /* ========================================================================= */
            <form onSubmit={handleMemberSubmit} className="space-y-4 pt-1 animate-fade-in">
              {/* Field 1: User ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  User ID
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={usernameOrId}
                    onChange={(e) => setUsernameOrId(e.target.value)}
                    placeholder="Enter User ID..."
                    className="w-full bg-[#f1f5f9] border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all outline-none"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Password</label>

                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#f1f5f9] border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition-all outline-none"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Member Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccessState}
                className={`w-full py-3.5 rounded-2xl shadow-md transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer ${
                  isSuccessState
                    ? 'bg-emerald-600 text-white scale-[1.02] shadow-emerald-500/25'
                    : isSubmitting
                    ? 'bg-emerald-600 text-white cursor-wait'
                    : 'bg-[#1e293b] hover:bg-[#0f172a] text-white'
                }`}
              >
                {isSubmitting && !isSuccessState ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : isSuccessState ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                  or
                </span>
              </div>

              {/* Dedicated Red Admin Button with Security Shield Icon */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  setIsAdminMode(true);
                  setError('');
                }}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white shadow-md shadow-rose-500/20 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-rose-100" />
                <span>Admin</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#94a3b8] mt-6 font-medium">
          &copy; 2026 Penumuli Perantalamma Youth Team
        </p>
      </div>
    </div>
  );
}
