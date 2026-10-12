'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Target,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  FileCode,
  BarChart2,
  Coffee,
  RotateCcw,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { StorageManager } from '@/lib/storage';
import { StudyDay, RevisionItem, PreloadedSubjectData, UserProfile } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(StorageManager.getUserProfile());
  const [curriculum, setCurriculum] = useState<PreloadedSubjectData[]>([]);
  const [today, setToday] = useState<StudyDay | null>(null);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);

  useEffect(() => {
    setProfile(StorageManager.getUserProfile());
    setCurriculum(StorageManager.getCurriculum());
    setToday(StorageManager.getTodayStudyDay());
    setRevisions(StorageManager.getRevisions());
    setStudyDays(StorageManager.getStudyDays());
  }, []);

  // Compute aggregate metrics
  const totalTopics = curriculum.reduce((acc, sub) => {
    return acc + sub.modules.reduce((mAcc, mod) => mAcc + mod.topics.length, 0);
  }, 0);

  const completedTopics = curriculum.reduce((acc, sub) => {
    return (
      acc +
      sub.modules.reduce(
        (mAcc, mod) => mAcc + mod.topics.filter((t) => t.isCompleted).length,
        0
      )
    );
  }, 0);

  const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Dynamic Today Study Minutes
  const todayMinutes = (today?.theoryStatus === 'completed' ? 50 : 0) + (today?.practicalStatus === 'completed' ? 60 : 0);
  const remainingMinutes = Math.max(0, 120 - todayMinutes);

  // Dynamic weekly study minutes from completed days
  const completedDaysCount = studyDays.filter((d) => d.status === 'completed').length;
  const weeklyStudyData = [
    { day: 'Mon', minutes: completedDaysCount >= 5 ? 120 : 0 },
    { day: 'Tue', minutes: completedDaysCount >= 4 ? 120 : 0 },
    { day: 'Wed', minutes: completedDaysCount >= 3 ? 120 : 0 },
    { day: 'Thu', minutes: completedDaysCount >= 2 ? 120 : 0 },
    { day: 'Fri', minutes: completedDaysCount >= 1 ? 120 : 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Today', minutes: todayMinutes },
  ];
  const weeklyTotalHours = ((completedDaysCount * 120 + todayMinutes) / 60).toFixed(1);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-5 h-5 text-blue-400" />;
      case 'FileCode':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5 text-amber-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-orange-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner with Apple Liquid Glass */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] apple-glass-elevated p-6 sm:p-8 md:p-10 border border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.55)]">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-blue-500/25 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="apple-glass-pill text-xs uppercase tracking-widest font-mono text-blue-200 font-bold px-3 py-1 rounded-full border border-blue-400/30">
                Harshal&apos;s StudyOS
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Day {today?.dayNumber || 1} of 150 • C-DAC PGCP-BDA Sprint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-300">Harshal</span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Today&apos;s mandatory gate: <strong className="text-blue-300 font-semibold">{today?.topicTitle || 'File Systems vs DBMS & Relational Architecture'}</strong>. Complete theory notes and hands-on practical lab to unlock the Day 1 assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/today"
              className="apple-btn-primary flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold cursor-pointer shadow-lg"
            >
              <span>{today?.status === 'completed' ? 'Review Today\'s Session' : `Start Day ${today?.dayNumber || 1} Study`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/coach"
              className="apple-btn-secondary flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Ask Coach</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row with Apple Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Streak */}
        <div className="apple-card p-6 rounded-[28px] border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.38)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-xs font-semibold text-slate-300">Study Streak</span>
            <div className="apple-glass-pill p-2 rounded-2xl bg-amber-500/15 border border-amber-400/35">
              <Flame className="w-4 h-4 text-[#ff9f0a] fill-[#ff9f0a]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5 my-1">
            {profile.currentStreak} <span className="text-xs font-normal text-slate-300 font-sans">days</span>
          </div>
          <div className="text-[11px] text-amber-300 mt-2 font-semibold">
            {profile.currentStreak === 0 ? '🔥 Start Day 1 to ignite streak' : `🔥 Best: ${profile.longestStreak} days`}
          </div>
        </div>

        {/* Daily Time */}
        <div className="apple-card p-6 rounded-[28px] border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.38)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-xs font-semibold text-slate-300">Today&apos;s Time</span>
            <div className="apple-glass-pill p-2 rounded-2xl bg-blue-500/15 border border-blue-400/35">
              <Clock className="w-4 h-4 text-[#0a84ff]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5 my-1">
            {todayMinutes} <span className="text-xs font-normal text-slate-300 font-sans">/ 120m</span>
          </div>
          <div className="text-[11px] text-blue-300 mt-2 font-semibold">
            {remainingMinutes === 0 ? '✓ Daily time goal reached!' : `${remainingMinutes}m remaining today`}
          </div>
        </div>

        {/* Syllabus Coverage */}
        <div className="apple-card p-6 rounded-[28px] border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.38)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-xs font-semibold text-slate-300">Syllabus Covered</span>
            <div className="apple-glass-pill p-2 rounded-2xl bg-emerald-500/15 border border-emerald-400/35">
              <Target className="w-4 h-4 text-[#30d158]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5 my-1">
            {syllabusPercent}%
          </div>
          <div className="text-[11px] text-emerald-300 mt-2 font-semibold">
            {completedTopics} of {totalTopics} completed
          </div>
        </div>

        {/* Exam Readiness */}
        <div className="apple-card p-6 rounded-[28px] border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.38)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-xs font-semibold text-slate-300">Exam Readiness</span>
            <div className="apple-glass-pill p-2 rounded-2xl bg-purple-500/15 border border-purple-400/35">
              <GraduationCap className="w-4 h-4 text-[#bf5af2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5 my-1">
            {syllabusPercent > 0 ? Math.round(syllabusPercent * 0.9 + 5) : 0}%
          </div>
          <div className="text-[11px] text-purple-300 mt-2 font-semibold">
            {syllabusPercent > 0 ? 'On Track • 150d target' : 'Sprint starting: 150 days'}
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Gate Status & Weekly Study Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Study Gate Status with Apple Glass Panel */}
        <div className="lg:col-span-2 apple-glass rounded-[28px] p-5 sm:p-7 md:p-8 space-y-5 border border-white/16 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/12">
            <div>
              <span className="text-xs font-mono text-blue-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Mandatory Completion Gate</span>
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Today&apos;s Focus: {today?.topicTitle || 'File Systems vs DBMS & Relational Architecture'}
              </h2>
            </div>
            <span className={`text-xs px-3.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider self-start sm:self-auto ${
              today?.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_15px_rgba(48,209,88,0.25)]'
                : 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_15px_rgba(255,159,10,0.25)]'
            }`}>
              {today?.status?.replace('_', ' ') || 'Not Started'}
            </span>
          </div>

          {/* Gate Step Progression with Frosted Apple Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Step 1: Theory */}
            <div className={`apple-subcard p-4 rounded-2xl border transition-all ${
              today?.theoryStatus === 'completed'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 shadow-[0_0_20px_rgba(48,209,88,0.15)]'
                : 'border-white/14 text-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono">1. THEORY (50m)</span>
                {today?.theoryStatus === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-200">Relational Architecture & ANSI/SPARC</p>
              <div className="text-[11px] text-emerald-300 mt-2 font-semibold">
                {today?.theoryStatus === 'completed' ? '✓ Completed' : 'Pending'}
              </div>
            </div>

            {/* Step 2: Practical Lab */}
            <div className={`apple-subcard p-4 rounded-2xl border transition-all ${
              today?.practicalStatus === 'completed'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                : today?.theoryStatus === 'completed'
                ? 'bg-amber-500/15 border-amber-400/40 text-amber-100 shadow-[0_0_20px_rgba(255,159,10,0.15)]'
                : 'border-white/14 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono">2. PRACTICAL (60m)</span>
                {today?.practicalStatus === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                ) : today?.theoryStatus === 'completed' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-200">Database Initialization & DDL Schema</p>
              <div className="text-[11px] text-amber-300 mt-2 font-semibold">
                {today?.practicalStatus === 'completed'
                  ? '✓ Completed'
                  : today?.theoryStatus === 'completed'
                  ? 'In Progress (Active)'
                  : 'Locked until Theory'}
              </div>
            </div>

            {/* Step 3: AI Quiz */}
            <div className={`apple-subcard p-4 rounded-2xl border transition-all ${
              today?.status === 'completed'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                : 'border-white/14 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono">3. AI QUIZ (10m)</span>
                <BrainCircuit className="w-4 h-4 text-purple-300" />
              </div>
              <p className="text-xs font-medium text-slate-300">10 Questions (Pass bar: 80%)</p>
              <div className="text-[11px] text-slate-300 mt-2 font-semibold">
                {today?.status === 'completed'
                  ? '✓ Passed'
                  : today?.practicalStatus === 'completed'
                  ? 'Unlocked! Ready to take'
                  : 'Locked until Practical'}
              </div>
            </div>
          </div>

          <div className="apple-subcard flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 rounded-2xl border border-white/14">
            <div className="text-xs text-slate-200 text-center sm:text-left">
              <span className="font-semibold text-white">Daily Gate Rule:</span> Complete and verify both theory and practical lab tasks before the daily assessment unlocks.
            </div>
            <Link
              href="/today"
              className="apple-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold shrink-0 cursor-pointer w-full sm:w-auto text-center"
            >
              Open Day {today?.dayNumber || 1} Workspace →
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Weekly Study Hours Chart with Apple Frosted Card */}
        <div className="apple-glass rounded-[28px] p-6 flex flex-col justify-between border border-white/16 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Weekly Consistency</h3>
              <span className="apple-glass-pill text-xs font-mono text-blue-200 font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/35">120m Goal</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 font-medium">Minutes studied per day</p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10, 14, 24, 0.9)', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '1rem', fontSize: '11px', backdropFilter: 'blur(20px)', color: '#ffffff' }}
                    itemStyle={{ color: '#0a84ff', fontWeight: 600 }}
                  />
                  <Bar dataKey="minutes" fill="#0a84ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-white/12 flex items-center justify-between text-xs text-slate-200">
            <span>Weekly Total:</span>
            <span className="text-white font-mono font-bold">{weeklyTotalHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Row 3: Four Core PGCP-BDA Subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Core PGCP-BDA Subjects</h2>
            <p className="text-xs text-slate-300">Track module coverage and mastery levels</p>
          </div>
          <Link href="/subjects" className="text-xs text-blue-300 hover:text-white font-semibold">
            Manage Syllabus & Resources →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {curriculum.map((subData) => {
            const sub = subData.subject;
            const subTotal = subData.modules.reduce((acc, m) => acc + m.topics.length, 0);
            const subDone = subData.modules.reduce(
              (acc, m) => acc + m.topics.filter((t) => t.isCompleted).length,
              0
            );
            const subPct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

            return (
              <div
                key={sub.id}
                className="apple-card p-6 rounded-[28px] flex flex-col justify-between border border-white/16 shadow-[0_12px_36px_rgba(0,0,0,0.38)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl apple-subcard">
                      {getSubjectIcon(sub.icon)}
                    </div>
                    <span className="apple-glass-pill text-[10px] font-mono text-slate-200 uppercase px-2.5 py-1 rounded-full font-bold">
                      {sub.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{sub.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">{sub.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/12">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Mastery</span>
                    <span className="text-white font-mono font-bold">{sub.overallMastery || 0}%</span>
                  </div>
                  <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/14">
                    <div
                      className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-full rounded-full"
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
                    <span>{subDone}/{subTotal} Topics</span>
                    <Link
                      href={`/subjects`}
                      className="text-blue-300 hover:text-white font-semibold"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Spaced Repetition Due & Final Exam Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revision Queue */}
        <div className="apple-glass rounded-[28px] p-6 md:p-7 border border-white/16 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Spaced Repetition Queue</h3>
            </div>
            <Link href="/revision" className="text-xs text-blue-300 hover:text-white font-semibold">
              View All ({revisions.length})
            </Link>
          </div>
          <div className="space-y-3">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="apple-subcard p-3.5 rounded-2xl border border-white/14 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-blue-300 uppercase font-semibold">
                    {rev.subjectTitle} • Stage {rev.stage} ({rev.intervalDays}d interval)
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{rev.topicTitle}</h4>
                </div>
                <Link
                  href="/revision"
                  className="apple-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Recall Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* AI Final Examination Readiness */}
        <div className="apple-glass rounded-[28px] p-6 md:p-7 border border-white/16 shadow-[0_16px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-purple-300" />
              <h3 className="font-bold text-sm text-white">Subject Final Exams (100 Marks)</h3>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              When all modules of a subject are completed, a 120-minute comprehensive AI final exam unlocks (40 theory marks + 60 practical marks).
            </p>
            <div className="mt-4 p-4 rounded-2xl apple-subcard bg-purple-500/10 border border-purple-400/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-purple-200">MySQL / DBMS Final Mock</span>
                <p className="text-[11px] text-slate-300 mt-0.5">Unlock condition: Complete remaining 12 topics</p>
              </div>
              <span className="apple-glass-pill px-2.5 py-1 rounded-full text-slate-200 text-[10px] font-mono uppercase font-semibold">
                Locked
              </span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-white/12 flex items-center justify-between">
            <span className="text-xs text-slate-400">Unlimited Practice Mock Mode</span>
            <Link
              href="/exams"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline"
            >
              Open Examination Centre →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
