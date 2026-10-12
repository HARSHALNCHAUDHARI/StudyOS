'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Sparkles,
  Sun,
  Moon,
  RotateCcw,
  Bell,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { UserProfile, UserSettings, AppNotification } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ onToggleMobileMenu, isMobileMenuOpen }: NavbarProps) {
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(StorageManager.getUserProfile());
  const [settings, setSettings] = useState<UserSettings>(StorageManager.getUserSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ isConfigured: boolean; model: string }>({
    isConfigured: false,
    model: 'gpt-4o-mini',
  });

  useEffect(() => {
    setProfile(StorageManager.getUserProfile());
    setSettings(StorageManager.getUserSettings());
    setNotifications(StorageManager.getNotifications());

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ai) {
          setAiStatus({
            isConfigured: data.ai.isConfigured,
            model: data.ai.model,
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    const newMode = !settings.darkMode;
    const updated = StorageManager.updateUserSettings({ darkMode: newMode });
    setSettings(updated);
    if (newMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  const handleResetDemo = () => {
    if (confirm('Reset all StudyOS data to Day 1 fresh state (150-Day Sprint)?')) {
      StorageManager.resetToDayOne();
      window.location.reload();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 border-b border-white/14 bg-black/40 backdrop-blur-3xl px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Left: Hamburger menu on mobile + Active Status & AI pill */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-2xl apple-glass text-slate-200 hover:text-white transition cursor-pointer border border-white/16 shrink-0"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4 text-blue-400" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Apple Style Active Owner Badge */}
        <div className="apple-glass-pill flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158] animate-pulse" />
          <span className="text-emerald-200 font-semibold tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Harshal (Owner)</span>
            <span className="sm:hidden font-bold">Harshal</span>
          </span>
        </div>

        {/* AI Provider Status Pill */}
        <div
          className={`apple-glass-pill hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium transition shrink-0 ${
            aiStatus.isConfigured
              ? 'bg-purple-500/15 border-purple-400/30 text-purple-200'
              : 'bg-blue-500/15 border-blue-400/30 text-blue-200'
          }`}
          title={aiStatus.isConfigured ? 'OpenAI model active' : 'Resilient offline engine with C-DAC curriculum generators'}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">AI: {aiStatus.isConfigured ? aiStatus.model : 'Apple Neural Engine'}</span>
          <span className="md:hidden">AI</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Daily Time Budget Badge */}
        <div className="apple-glass-pill flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs text-slate-100">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline text-slate-300">Budget:</span>
          <span className="font-bold text-white font-mono">{profile.dailyTimeBudget}m</span>
        </div>

        {/* Study Streak Badge with Apple Orange */}
        <div className="apple-glass-pill flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-xs text-amber-200 font-semibold">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline text-amber-300">Streak:</span>
          <span className="font-bold text-white font-mono">{profile.currentStreak}d</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="apple-glass-pill p-2 rounded-2xl text-slate-200 hover:text-white relative transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff453a] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-3xl apple-glass-elevated p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[11px] text-slate-300 font-medium">{unreadCount} unread</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      StorageManager.markNotificationRead(n.id);
                      setNotifications(StorageManager.getNotifications());
                    }}
                    className={`p-3 rounded-2xl text-xs cursor-pointer transition ${
                      n.isRead
                        ? 'bg-black/30 text-slate-400 border border-transparent'
                        : 'bg-white/[0.1] text-slate-100 border border-blue-400/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-white mb-0.5">
                      <span>{n.title}</span>
                      {n.isRead && <CheckCircle2 className="w-3 h-3 text-slate-500" />}
                    </div>
                    <p className="text-[11px] text-slate-300">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 mt-2 text-center">
                <Link
                  href="/reminders"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-[11px] text-blue-400 hover:underline font-semibold"
                >
                  Manage Reminders & Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="apple-glass-pill p-2 rounded-2xl text-slate-300 hover:text-white transition cursor-pointer"
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Reset Demo Button (Hidden on xs mobile screens to save space) */}
        <button
          onClick={handleResetDemo}
          className="apple-glass-pill hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-rose-300 text-xs transition cursor-pointer"
          title="Reset demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Owner Profile & Lock Button */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md ring-1 ring-white/20">
              H
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-tight">Harshal</p>
              <p className="text-[10px] text-blue-300 leading-tight font-mono font-medium">Owner</p>
            </div>
          </div>

          {/* Apple Style Lock Button */}
          <button
            onClick={logout}
            className="apple-glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/35 text-rose-200 text-xs font-semibold transition cursor-pointer"
            title="Lock workspace and sign out"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Lock</span>
          </button>
        </div>
      </div>
    </header>
  );
}
