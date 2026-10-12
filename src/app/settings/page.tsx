'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Download,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { AuthManager } from '@/lib/auth';
import { UserProfile, UserSettings } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(StorageManager.getUserProfile());
  const [settings, setSettings] = useState<UserSettings>(StorageManager.getUserSettings());
  const [ownerPin, setOwnerPin] = useState('1234');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setProfile(StorageManager.getUserProfile());
    setSettings(StorageManager.getUserSettings());
    setOwnerPin(AuthManager.getOwnerPin());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.updateUserProfile(profile);
    StorageManager.updateUserSettings(settings);
    if (ownerPin.trim()) {
      AuthManager.setOwnerPin(ownerPin.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    const jsonStr = StorageManager.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyOS_AI_Student_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data and start fresh from Day 1 with the 150-Day target sprint?')) {
      StorageManager.resetToDayOne();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="apple-glass-elevated p-6 md:p-8 rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl apple-subcard text-blue-400 shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">System Settings & Security</h1>
            <p className="text-xs text-slate-200 mt-0.5">Manage owner credentials, time budget, and data backup.</p>
          </div>
        </div>

        {saveSuccess && (
          <span className="apple-glass-pill flex items-center gap-1.5 text-xs text-emerald-200 bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-400/40 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Owner Security Credentials Card */}
        <div className="apple-glass p-6 md:p-7 rounded-[28px] border border-white/18 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/12">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Owner Access & Security (Harshal Only)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Owner Master PIN</label>
              <div className="relative">
                <input
                  type="text"
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="apple-input w-full rounded-2xl px-4 py-3 text-white font-mono focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-300 mt-1 block">Used on the lock screen for quick 1-tap or PIN unlocking.</span>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Authorized Owner Email</label>
              <input
                type="email"
                disabled
                value="harshal@cdac.in"
                className="apple-subcard w-full rounded-2xl px-4 py-3 text-slate-300 cursor-not-allowed font-mono opacity-80"
              />
              <span className="text-[11px] text-slate-300 mt-1 block">Locked to Harshal (C-DAC PGCP-BDA Scholar).</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="apple-glass p-6 md:p-7 rounded-[28px] border border-white/18 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/12">
            <User className="w-4 h-4 text-blue-400" />
            <span>Student Profile & Timeline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Daily Study Budget (Minutes)</label>
              <input
                type="number"
                value={profile.dailyTimeBudget}
                onChange={(e) => setProfile({ ...profile, dailyTimeBudget: Number(e.target.value) })}
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">Target Exam Horizon Date</label>
              <input
                type="date"
                value={profile.targetExamDate}
                onChange={(e) => setProfile({ ...profile, targetExamDate: e.target.value })}
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Assessment & Gate Preferences */}
        <div className="apple-glass p-6 md:p-7 rounded-[28px] border border-white/18 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/12">
            <Shield className="w-4 h-4 text-purple-300" />
            <span>Assessment & Completion Gate Standards</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                Daily Quiz Pass Threshold (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={settings.passThreshold}
                onChange={(e) => setSettings({ ...settings, passThreshold: Number(e.target.value) })}
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none font-mono"
              />
              <span className="text-[11px] text-slate-300 mt-1 block">Default is 80% to enforce rigorous mastery.</span>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                Curriculum Rotation Strategy
              </label>
              <select
                value={settings.subjectRotationStrategy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subjectRotationStrategy: e.target.value as any,
                  })
                }
                className="apple-input w-full rounded-2xl px-4 py-3 text-white focus:outline-none bg-[#0a0e1a]"
              >
                <option value="balanced_daily">Balanced Daily (Alternating Core Subjects)</option>
                <option value="block_mastery">Block Mastery (Complete 1 Subject at a Time)</option>
                <option value="exam_priority">Exam Priority (Focus on Weakest Subjects First)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="apple-btn-primary flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-bold text-xs shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings & Master PIN</span>
          </button>
        </div>
      </form>

      {/* Data Export & Reset Zone */}
      <div className="apple-glass p-6 md:p-7 rounded-[28px] border border-white/18 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <h2 className="text-sm font-bold text-white pb-3 border-b border-white/12">
          Data Portability & State Management
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold text-white">Full JSON Progress Export</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Download all syllabus, quiz attempts, and submission logs.</p>
          </div>
          <button
            onClick={handleExportData}
            className="apple-btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Data (JSON)</span>
          </button>
        </div>

        <div className="pt-3 border-t border-white/12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold text-rose-300">Reset to Day 1 (150-Day Sprint)</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Wipe all records and restart your study journey cleanly from Day 1 with the 150-day target.</p>
          </div>
          <button
            onClick={handleResetData}
            className="apple-glass-pill flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/15 border border-rose-400/35 text-rose-200 hover:bg-rose-500/25 font-semibold text-xs transition cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset to Clean Day 1 State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
