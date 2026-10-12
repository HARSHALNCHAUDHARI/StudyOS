'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { FinalExamAttempt } from '@/types';

const MOCK_EXAM = {
  id: 'exam-mysql',
  subjectId: 'sub-mysql',
  subjectTitle: 'MySQL / DBMS',
  title: 'C-DAC PGCP-BDA Comprehensive MySQL/DBMS Final Examination',
  totalMarks: 100,
  theoryMarks: 40,
  practicalMarks: 60,
  passThreshold: 60,
  durationMins: 120,
  theoryQuestions: [
    {
      id: 'fe-q1',
      marks: 10,
      question: 'Explain the 3-schema architecture of DBMS and analyze how physical data independence differs from logical data independence.',
    },
    {
      id: 'fe-q2',
      marks: 10,
      question: 'Given relation R(A, B, C, D, E) with FDs: {A -> BC, CD -> E, B -> D, E -> A}. Find all candidate keys and identify the highest normal form of R.',
    },
    {
      id: 'fe-q3',
      marks: 10,
      question: 'Compare B-Tree and Hash indexing in MySQL InnoDB. Under what query workloads does each perform optimally?',
    },
    {
      id: 'fe-q4',
      marks: 10,
      question: 'Detail the ACID properties of RDBMS and explain the two-phase locking (2PL) protocol for concurrency control.',
    },
  ],
  practicalQuestions: [
    {
      id: 'fe-pq1',
      marks: 20,
      question: 'Write DDL to create a banking schema with Accounts and Transactions tables enforcing CHECK (balance >= 1000) and ON DELETE RESTRICT.',
    },
    {
      id: 'fe-pq2',
      marks: 20,
      question: 'Write a correlated SQL query to find employees earning more than the average salary of their respective departments, ordered by department and salary descending.',
    },
    {
      id: 'fe-pq3',
      marks: 20,
      question: 'Design a stored procedure or transaction script that transfers Rs. 15,000 between two accounts safely using SAVEPOINT and ROLLBACK upon overdraft.',
    },
  ],
};

export default function FinalExamsPage() {
  const [examActive, setExamActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<FinalExamAttempt | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<FinalExamAttempt[]>([]);

  useEffect(() => {
    setAttemptsHistory(StorageManager.getFinalExamAttempts());
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && timeLeft > 0 && !submittedAttempt) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, timeLeft, submittedAttempt]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamActive(true);
    setSubmittedAttempt(null);
    setTimeLeft(120 * 60);
  };

  const handleSubmitExam = () => {
    // Evaluation: 78% mock score
    const theoryScore = 32; // out of 40
    const practicalScore = 48; // out of 60
    const totalScore = theoryScore + practicalScore; // 80 out of 100
    const percentage = totalScore;
    const passed = percentage >= MOCK_EXAM.passThreshold;

    const attempt: FinalExamAttempt = {
      id: `attempt-exam-${Date.now()}`,
      examId: MOCK_EXAM.id,
      userId: 'usr-student-01',
      theoryScore,
      practicalScore,
      totalScore,
      percentage,
      passed,
      isMockMode: true,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      submittedAt: new Date().toISOString(),
      remediationPlan: {
        weakTopics: ['Correlated Subquery Optimization', 'Lossless Decomposition Proofs'],
        recommendedActions: [
          'Review BCNF candidate key testing exercises in Module 2.',
          'Solve 5 timed correlated query problems using EXISTS vs IN.',
        ],
        summary: 'Excellent performance on DDL, constraints, and transactions. Refine query tuning for full marks.',
      },
    };

    StorageManager.saveFinalExamAttempt(attempt);
    setSubmittedAttempt(attempt);
    setAttemptsHistory(StorageManager.getFinalExamAttempts());
    setExamActive(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="apple-glass-elevated p-6 md:p-8 rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="apple-glass-pill text-xs font-mono font-bold text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/35 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>Final Examinations</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">100 Marks • 120 Minutes</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Subject Final Mock & Evaluation Arena
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Comprehensive C-DAC evaluation covering the complete configured syllabus: 40 Theory Marks + 60 Practical Marks.
          </p>
        </div>

        {examActive && (
          <div className="apple-glass-pill flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/20 shadow-md">
            <Clock className="w-5 h-5 text-indigo-300" />
            <div className="font-mono">
              <div className="text-xl font-extrabold text-white">{formatTimer(timeLeft)}</div>
              <div className="text-[10px] text-slate-300 leading-none mt-0.5 font-medium">Time Left</div>
            </div>
          </div>
        )}
      </div>

      {/* EXAM NOT STARTED VIEW */}
      {!examActive && !submittedAttempt && (
        <div className="space-y-6">
          <div className="apple-glass p-8 md:p-10 rounded-[32px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/12">
              <div>
                <span className="text-xs font-mono text-indigo-300 uppercase font-bold tracking-wider">
                  {MOCK_EXAM.subjectTitle}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{MOCK_EXAM.title}</h2>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Full syllabus assessment: Relational Architecture, Normalization, Advanced SQL, Indexing & Transactions.
                </p>
              </div>

              <button
                onClick={handleStartExam}
                className="apple-btn-primary flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-xs shadow-lg cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Final Mock Exam (120 Mins)</span>
              </button>
            </div>

            {/* Exam Structure Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="apple-subcard p-5 rounded-2xl border border-white/14 text-xs">
                <span className="font-mono font-bold text-slate-300 uppercase">Theory Section</span>
                <div className="text-2xl font-black text-white mt-1 font-mono">40 Marks</div>
                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                  4 Subjective & Analytical questions (10 marks each).
                </p>
              </div>

              <div className="apple-subcard p-5 rounded-2xl border border-white/14 text-xs">
                <span className="font-mono font-bold text-slate-300 uppercase">Practical Section</span>
                <div className="text-2xl font-black text-white mt-1 font-mono">60 Marks</div>
                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                  3 Heavy SQL coding & procedure challenges (20 marks each).
                </p>
              </div>

              <div className="apple-subcard p-5 rounded-2xl border border-white/14 text-xs">
                <span className="font-mono font-bold text-slate-300 uppercase">Passing Benchmark</span>
                <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">60% Overall</div>
                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                  Standard C-DAC PGCP-BDA examination clearance benchmark.
                </p>
              </div>
            </div>
          </div>

          {/* Past Attempts Table */}
          {attemptsHistory.length > 0 && (
            <div className="apple-glass p-6 md:p-7 rounded-[28px] border border-white/18 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <h3 className="font-bold text-sm text-white">Past Examination Attempts</h3>
              <div className="divide-y divide-white/10">
                {attemptsHistory.map((att) => (
                  <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">Score: {att.totalScore}/100 ({att.percentage}%)</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Theory: {att.theoryScore}/40 • Practical: {att.practicalScore}/60</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
                      att.passed ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                    }`}>
                      {att.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE EXAM PAPER VIEW */}
      {examActive && (
        <div className="space-y-6">
          {/* Section 1: Theory */}
          <div className="apple-glass p-7 md:p-8 rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="pb-3 border-b border-white/12">
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">Section A</span>
              <h2 className="text-base font-bold text-white mt-0.5">Theory & System Architecture (40 Marks)</h2>
            </div>

            <div className="space-y-6">
              {MOCK_EXAM.theoryQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-100">
                    <span>Q{idx + 1}. {q.question}</span>
                    <span className="apple-glass-pill text-[10px] font-mono text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/35 shrink-0 font-bold">
                      [{q.marks} Marks]
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="apple-input w-full rounded-2xl p-4 text-slate-100 focus:outline-none font-mono text-xs shadow-inner"
                    placeholder="Enter your detailed technical answer..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Practical */}
          <div className="apple-glass p-7 md:p-8 rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="pb-3 border-b border-white/12">
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">Section B</span>
              <h2 className="text-base font-bold text-white mt-0.5">Practical Queries & Data Modeling (60 Marks)</h2>
            </div>

            <div className="space-y-6">
              {MOCK_EXAM.practicalQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-100">
                    <span>Q{idx + 5}. {q.question}</span>
                    <span className="apple-glass-pill text-[10px] font-mono text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/35 shrink-0 font-bold">
                      [{q.marks} Marks]
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="apple-input w-full rounded-2xl p-4 text-slate-100 focus:outline-none font-mono text-xs shadow-inner"
                    placeholder="Write clean SQL DDL / DQL statements..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={handleSubmitExam}
              className="apple-btn-primary px-8 py-3.5 rounded-full font-bold text-sm shadow-xl cursor-pointer"
            >
              Submit Final Examination for AI Grading
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSION RESULT REPORT */}
      {submittedAttempt && (
        <div className="apple-glass-elevated p-8 md:p-10 rounded-[32px] border border-white/24 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/12">
            <div className="flex items-center gap-4">
              <div className="apple-glass-pill w-16 h-16 rounded-2xl bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 flex items-center justify-center font-bold text-2xl font-mono shadow-md">
                {submittedAttempt.totalScore}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <span>Examination Passed!</span>
                  <ShieldCheck className="w-5 h-5 text-[#30d158]" />
                </h2>
                <p className="text-xs text-slate-200 mt-1">
                  Total Marks: <strong className="text-white font-semibold">80/100</strong> (Theory: 32/40 • Practical: 48/60)
                </p>
              </div>
            </div>

            <button
              onClick={() => setSubmittedAttempt(null)}
              className="apple-btn-secondary px-5 py-2.5 rounded-full text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Back to Examination Dashboard
            </button>
          </div>

          {/* AI Remediation Plan */}
          {submittedAttempt.remediationPlan && (
            <div className="apple-subcard p-5 rounded-2xl bg-indigo-950/30 border border-indigo-400/35 space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Personalized AI Remediation Plan</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {submittedAttempt.remediationPlan.summary}
              </p>
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                  Identified Weak Topics:
                </span>
                <ul className="list-disc pl-4 text-xs text-slate-200 mt-1 space-y-1">
                  {submittedAttempt.remediationPlan.weakTopics.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
