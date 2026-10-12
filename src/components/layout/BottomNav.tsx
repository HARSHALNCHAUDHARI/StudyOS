'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  Sparkles,
  BrainCircuit,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();

  // If on login, do not render bottom dock
  if (pathname === '/login') return null;

  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Today', href: '/today', icon: CalendarCheck2, isGate: true },
    { label: 'Coach', href: '/coach', icon: Sparkles, isAi: true },
    { label: 'Quiz', href: '/quiz', icon: BrainCircuit },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="apple-glass-elevated bg-[#0a0d18]/90 backdrop-blur-3xl border border-white/22 rounded-full px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow pill behind icon */}
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/25 to-indigo-500/25 rounded-full border border-blue-400/40 shadow-[0_0_12px_rgba(10,132,255,0.3)] animate-fadeIn" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? item.isAi
                        ? 'text-purple-300 scale-110'
                        : 'text-blue-400 scale-110'
                      : ''
                  }`}
                />
                {item.isGate && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />
                )}
                {item.isAi && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More / Menu Button to open complete 11-module sidebar drawer */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Open full curriculum menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
        </button>
      </div>
    </nav>
  );
}
