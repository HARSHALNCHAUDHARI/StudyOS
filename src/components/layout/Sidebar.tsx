'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck2,
  BrainCircuit,
  Code2,
  RotateCcw,
  GraduationCap,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'My Subjects', href: '/subjects', icon: BookOpen },
  { label: "Today's Study", href: '/today', icon: CalendarCheck2, badge: 'Gate' },
  { label: 'AI Quiz Arena', href: '/quiz', icon: BrainCircuit },
  { label: 'Practical Lab', href: '/practical', icon: Code2 },
  { label: 'Revision Centre', href: '/revision', icon: RotateCcw },
  { label: 'Final Examinations', href: '/exams', icon: GraduationCap },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Calendar & Reminders', href: '/reminders', icon: Bell },
  { label: 'Notes & Resources', href: '/resources', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = React.useState(StorageManager.getUserProfile());

  React.useEffect(() => {
    setProfile(StorageManager.getUserProfile());
  }, []);

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(profile.targetExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const progressPercent = Math.min(100, Math.max(2, Math.round(((150 - daysRemaining) / 150) * 100)));

  const handleLinkClick = () => {
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(10,132,255,0.4)] shrink-0">
            <div className="w-full h-full bg-[#07090e]/90 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg text-white">
              OS
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              StudyOS <span className="text-[10px] bg-white/[0.12] text-blue-300 px-1.5 py-0.5 rounded-full font-mono border border-white/25">AI</span>
            </h1>
            <p className="text-[10px] text-slate-300 font-mono tracking-wider uppercase">C-DAC PGCP-BDA</p>
          </div>
        </Link>

        {/* Close button for mobile drawer */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
      </div>

      {/* AI Study Coach Pill Banner */}
      <div className="px-3 pt-3 shrink-0">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-blue-500/15 border border-purple-400/30 backdrop-blur-xl shadow-sm hover:border-purple-400/50 transition">
          <Link
            href="/coach"
            onClick={handleLinkClick}
            className="flex items-center justify-between group text-purple-200 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span className="text-xs font-semibold tracking-tight text-white">AI Study Coach</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Scrollable Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0 overscroll-contain">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/25 to-indigo-500/20 text-white font-semibold border border-blue-400/35 shadow-[0_4px_16px_rgba(10,132,255,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/14 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold border border-amber-400/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Target Exam Countdown Footer firmly anchored at bottom */}
      <div className="p-3 shrink-0 border-t border-white/10 bg-black/40">
        <div className="p-3.5 border border-white/14 bg-white/[0.04] rounded-2xl backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-slate-200 mb-1.5 font-medium">
            <span>Sprint Horizon</span>
            <span className="text-blue-300 font-bold font-mono">{daysRemaining} Days</span>
          </div>
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/12">
            <div
              className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center italic tracking-tight">Learn. Practise. Prove. Progress.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/14 bg-black/40 backdrop-blur-3xl flex-col shrink-0 h-screen sticky top-0 overflow-hidden z-20 shadow-[10px_0_40px_rgba(0,0,0,0.4)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Frosted Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn cursor-pointer"
            aria-label="Close sidebar overlay"
          />

          {/* Slide-out Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full max-h-screen border-r border-white/20 bg-[#070912]/95 backdrop-blur-3xl z-50 shadow-[20px_0_60px_rgba(0,0,0,0.85)] flex flex-col animate-slideRight overflow-hidden">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
