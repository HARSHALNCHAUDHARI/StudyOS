'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../auth/AuthProvider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, isLoading } = useAuth();

  // If on login page, render full screen auth view
  if (pathname === '/login') {
    return <main className="min-h-screen w-full bg-[#0a0c13]">{children}</main>;
  }

  // If loading session, show sleek Apple glass splash
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0c13] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-3xl apple-glass flex items-center justify-center font-bold text-white text-2xl shadow-2xl animate-pulse border border-white/20">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            OS
          </span>
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-wider">Verifying Owner Credentials...</p>
      </div>
    );
  }

  // If unauthenticated and outside login page, protect app shell from rendering
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#0a0c13] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-3xl apple-glass flex items-center justify-center font-bold text-white text-2xl shadow-2xl animate-pulse border border-white/20">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            OS
          </span>
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-wider">Redirecting to Owner Login...</p>
      </div>
    );
  }

  // Authenticated full app view with Apple ambient vibrancy
  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting orbs for real Apple vibrancy & glass refraction */}
      <div className="fixed -top-24 left-48 w-[48rem] h-[36rem] bg-gradient-to-br from-blue-600/22 via-indigo-600/16 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed -bottom-24 right-0 w-[52rem] h-[40rem] bg-gradient-to-tl from-purple-600/20 via-indigo-600/14 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-1/6 w-[36rem] h-[36rem] bg-gradient-to-br from-cyan-500/14 via-blue-500/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-1/3 w-[30rem] h-[30rem] bg-gradient-to-tr from-amber-500/8 via-purple-600/8 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Fixed Glass Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
