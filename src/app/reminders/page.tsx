'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Settings,
  AlertCircle,
  VolumeX,
  Volume2,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { UserSettings, AppNotification } from '@/types';

export default function RemindersPage() {
  const [settings, setSettings] = useState<UserSettings>(StorageManager.getUserSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [browserPermission, setBrowserPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    setSettings(StorageManager.getUserSettings());
    setNotifications(StorageManager.getNotifications());

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        const updated = StorageManager.updateUserSettings({ notificationBrowser: true });
        setSettings(updated);
        new Notification('StudyOS AI', {
          body: 'Browser study reminders activated successfully!',
        });
      }
    } else {
      alert('Your browser does not support Web Notifications API.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.updateUserSettings(settings);
    alert('Reminder schedule & notification preferences saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="apple-glass p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="apple-glass-pill text-[11px] font-mono font-semibold text-blue-300 px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span>Notification Hub</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Timezone-Aware</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Study Reminders & Notification Centre
          </h1>
          <p className="text-sm text-slate-300/90 mt-1 max-w-2xl">
            Configure daily study alarms, quiet hours, and inspect automated spaced repetition alert logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Preferences Form (2 cols) */}
        <div className="lg:col-span-2 apple-glass p-7 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-white pb-3 border-b border-white/10">
            Reminder Scheduling Preferences
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Daily study alarm & timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-200 font-bold mb-1.5 text-xs">
                  Daily Study Alarm Time
                </label>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="w-full apple-input p-3 text-white rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1.5 text-xs">User Timezone</label>
                <select
                  value={settings.userTimezone}
                  onChange={(e) => setSettings({ ...settings, userTimezone: e.target.value })}
                  className="w-full apple-input p-3 text-white rounded-xl text-xs bg-slate-900"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-5 rounded-2xl apple-subcard space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Quiet Hours (No notifications sent)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">Start Time</label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                    className="w-full apple-input p-2.5 text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">End Time</label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                    className="w-full apple-input p-2.5 text-white rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Browser Permission Control */}
            <div className="p-5 rounded-2xl apple-subcard flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Browser Push Notifications</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Status: <strong className="font-mono text-blue-400 uppercase">{browserPermission}</strong>
                </p>
              </div>
              {browserPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestBrowserPermission}
                  className="apple-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  Enable Browser Push
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 apple-glass-pill px-3 py-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Enabled
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="apple-btn-primary px-6 py-3 rounded-xl text-xs font-bold shadow-lg"
              >
                Save Notification Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right: Notification History (1 col) */}
        <div className="apple-glass p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-sm text-white">Notification History</h3>
            <span className="apple-glass-pill text-[11px] text-slate-300 font-mono px-2.5 py-0.5">{notifications.length} Total</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl apple-subcard text-xs space-y-1.5"
              >
                <div className="font-bold text-white text-sm">{n.title}</div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{n.message}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
