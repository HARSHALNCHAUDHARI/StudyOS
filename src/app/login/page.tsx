'use client';

import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { session, login, quickUnlock } = useAuth();
  const [identifier, setIdentifier] = useState('harshal@cdac.in');
  const [secret, setSecret] = useState('77965');
  const [showSecret, setShowSecret] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect straight to dashboard
  React.useEffect(() => {
    if (session) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const ok = login(identifier, secret);
    if (!ok) {
      setErrorMsg('Access denied. Invalid Owner PIN or Credentials.');
      setIsSubmitting(false);
    }
  };

  const handleQuickUnlock = () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    quickUnlock();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#07090e]">
      {/* Apple-style soft ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-gradient-to-br from-blue-600/25 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-tl from-purple-600/20 via-blue-500/12 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-gradient-to-br from-cyan-500/12 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Main Apple Frosted Glass Card */}
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="apple-glass-elevated p-8 md:p-10 rounded-[36px] border border-white/24 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
          {/* Header Branding */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_8px_25px_rgba(10,132,255,0.4)] mb-3 group hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090e]/90 rounded-[22px] flex items-center justify-center">
                <span className="font-extrabold text-2xl tracking-tighter text-white">
                  OS
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                StudyOS <span className="text-xs bg-white/[0.14] text-blue-300 px-2.5 py-0.5 rounded-full font-mono border border-white/25 font-bold">AI</span>
              </h1>
            </div>

            <p className="text-xs text-slate-200 font-medium tracking-wide">
              Restricted Access • <strong className="text-white font-semibold">Harshal&apos;s Study Workspace</strong>
            </p>
            <div className="apple-glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-amber-200 font-mono mt-1 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>C-DAC PGCP-BDA Scholar Portal</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Owner Identifier</span>
                <span className="text-[10px] text-slate-400 font-mono">harshal@cdac.in</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or username"
                className="apple-input w-full rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Master PIN / Password</span>
                <span className="text-[10px] text-blue-400 font-mono">Default PIN: 77965</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter PIN (77965) or password"
                  className="apple-input w-full rounded-2xl px-4 py-3 pr-10 text-xs placeholder-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn-primary w-full mt-2 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating & Entering StudyOS...' : 'Unlock StudyOS AI'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick 1-Click Owner Unlock */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
            <span className="text-[11px] text-slate-400 block font-medium">Quick Authenticate for Harshal:</span>
            <button
              type="button"
              onClick={handleQuickUnlock}
              disabled={isSubmitting}
              className="apple-btn-secondary w-full py-2.5 rounded-2xl text-xs font-semibold transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>{isSubmitting ? 'Entering StudyOS...' : 'Instant Owner Unlock (1-Tap)'}</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-500 font-mono tracking-tight">
              Authorized only for Harshal • Single-device session protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
