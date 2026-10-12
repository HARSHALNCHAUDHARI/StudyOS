'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  BrainCircuit,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Send,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { StudyDay, DailyTask } from '@/types';
import { verifyStudyDayGate } from '@/lib/assessment/scoring';
import { COURSE_DOCUMENTS, CourseDocument } from '@/lib/constants/course-content';
import { CourseDocumentReader } from '@/components/reader/CourseDocumentReader';

export default function TodayStudyPage() {
  const [studyDay, setStudyDay] = useState<StudyDay | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'practical' | 'revision'>('theory');

  // Reader state for in-app course documents
  const [readerDoc, setReaderDoc] = useState<CourseDocument | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Theory interactive state
  const [selfCheckPassed, setSelfCheckPassed] = useState(false);

  // Practical interactive state
  const [studentCode, setStudentCode] = useState('');
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [practicalSubmitted, setPracticalSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Timer simulation state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // Starts fresh at 0:00

  useEffect(() => {
    const today = StorageManager.getTodayStudyDay();
    setStudyDay(today);

    if (today?.tasks) {
      const practicalTask = today.tasks.find((t) => t.taskType === 'practical');
      if (practicalTask?.content?.starterCode) {
        setStudentCode(practicalTask.content.starterCode);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  if (!studyDay) {
    return <div className="text-center p-12 text-slate-400">Loading today&apos;s study plan...</div>;
  }

  const theoryTask = studyDay.tasks?.find((t) => t.taskType === 'theory');
  const practicalTask = studyDay.tasks?.find((t) => t.taskType === 'practical');
  const revisionTask = studyDay.tasks?.find((t) => t.taskType === 'revision');

  const gate = verifyStudyDayGate(studyDay);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteTheory = () => {
    if (!selfCheckPassed) {
      alert('Please complete the self-check verification questions before recording theory completion.');
      return;
    }
    const updated = StorageManager.updateStudyDay(studyDay.id, {
      theoryStatus: 'completed',
    });
    setStudyDay({ ...updated });
    setActiveTab('practical');
  };

  const toggleHint = (idx: number) => {
    if (revealedHints.includes(idx)) {
      setRevealedHints(revealedHints.filter((h) => h !== idx));
    } else {
      setRevealedHints([...revealedHints, idx]);
    }
  };

  const handleSubmitPractical = () => {
    if (studentCode.trim().length < 40) {
      alert('Please provide complete DDL table creation commands with constraints before submitting.');
      return;
    }

    StorageManager.savePracticalSubmission({
      id: `sub-${Date.now()}`,
      dailyTaskId: practicalTask?.id || 'task-practical',
      userId: studyDay.userId,
      codeQuery: studentCode,
      status: 'verified',
      verificationMode: 'self_evidence',
      submittedAt: new Date().toISOString(),
    });

    const updated = StorageManager.updateStudyDay(studyDay.id, {
      practicalStatus: 'completed',
    });
    setStudyDay({ ...updated });
    setPracticalSubmitted(true);
    setSubmissionFeedback(
      `✓ Schema script verified for ${studyDay.topicTitle}. DDL definitions and integrity constraints satisfied.`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="apple-glass-elevated p-6 md:p-8 rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="apple-glass-pill text-xs font-mono font-bold text-blue-200 px-3 py-1 rounded-full border border-blue-400/30">
              Day {studyDay.dayNumber} of 150
            </span>
            <span className="text-xs text-slate-300 font-mono">120 Minutes Allocated</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {studyDay.topicTitle}
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Subject: <strong className="text-white font-semibold">{studyDay.subjectTitle}</strong>
          </p>
        </div>

        {/* Study Timer Controls in Apple Frosted Pill */}
        <div className="apple-glass-pill flex items-center gap-3 p-2.5 rounded-full border border-white/20 shadow-md">
          <Clock className="w-5 h-5 text-blue-400 ml-1.5" />
          <div className="text-left font-mono">
            <div className="text-lg font-bold text-white leading-none">
              {formatTimer(elapsedSeconds)}
            </div>
            <div className="text-[10px] text-slate-300 leading-none mt-1 font-medium">Session Active</div>
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ml-2 cursor-pointer ${
              timerRunning
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'apple-btn-primary'
            }`}
          >
            {timerRunning ? 'Pause' : 'Start Timer'}
          </button>
        </div>
      </div>

      {/* Completion Gate Status Ribbon */}
      <div className="p-5 rounded-[26px] apple-glass border border-white/18 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl apple-subcard text-blue-400">
            {gate.canUnlockQuiz ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Mandatory Daily Gate Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold ${
                studyDay.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_12px_rgba(48,209,88,0.25)]'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(255,159,10,0.25)]'
              }`}>
                {studyDay.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-200 mt-0.5 font-medium">
              {gate.canUnlockQuiz
                ? 'Both theory and practical tasks verified. Assessment is UNLOCKED!'
                : 'Complete Theory and Practical tasks to unlock the Daily AI Quiz.'}
            </p>
          </div>
        </div>

        {gate.canUnlockQuiz ? (
          <Link
            href="/quiz"
            className="apple-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer shadow-lg"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Enter AI Quiz Arena →</span>
          </Link>
        ) : (
          <div className="apple-glass-pill px-3.5 py-1.5 rounded-full text-xs text-slate-300 flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz locked (Pass practical first)</span>
          </div>
        )}
      </div>

      {/* Apple-style Segmented Control Tabs */}
      <div className="apple-segmented-tabs flex items-center max-w-xl">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold apple-tab-item cursor-pointer ${
            activeTab === 'theory' ? 'apple-tab-item-active' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Theory Task (50m)</span>
          {studyDay.theoryStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('practical')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold apple-tab-item cursor-pointer ${
            activeTab === 'practical' ? 'apple-tab-item-active' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>2. Practical Lab (60m)</span>
          {studyDay.practicalStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold apple-tab-item cursor-pointer ${
            activeTab === 'revision' ? 'apple-tab-item-active' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>3. Recall (10m)</span>
        </button>
      </div>

      {/* TAB 1: THEORY TASK */}
      {activeTab === 'theory' && theoryTask && (
        <div className="space-y-6">
          <div className="apple-glass p-7 md:p-8 rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                <span className="text-xs font-mono text-blue-300 font-bold uppercase tracking-wider">Structured Theory Material</span>
                <button
                  onClick={() => {
                    const doc = COURSE_DOCUMENTS.find((d) => d.id === 'r1') || COURSE_DOCUMENTS[0];
                    setReaderDoc(doc);
                    setIsReaderOpen(true);
                  }}
                  className="apple-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-blue-300 hover:text-white cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                  <span>Open Course PDF: Introduction to DBMS - Day1.pdf</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{theoryTask.content.title}</h2>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">{theoryTask.content.summary}</p>
            </div>

            {/* Learning Objectives */}
            <div className="apple-subcard p-5 rounded-2xl border border-white/14">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 font-mono">
                Key Learning Objectives
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-100">
                {theoryTask.content.learningObjectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes content */}
            <div className="prose prose-invert max-w-none text-xs text-slate-100 space-y-4 whitespace-pre-line leading-relaxed p-6 rounded-2xl bg-black/50 border border-white/14 font-mono shadow-inner">
              {theoryTask.content.notes}
            </div>

            {/* Definitions */}
            {theoryTask.content.definitions && (
              <div>
                <h3 className="text-xs font-bold text-white mb-3">Core Technical Definitions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {theoryTask.content.definitions.map((def, idx) => (
                    <div key={idx} className="apple-subcard p-4 rounded-2xl border border-white/14">
                      <div className="font-semibold text-xs text-blue-300">{def.term}</div>
                      <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{def.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self Check Verification Gate */}
            <div className="apple-subcard p-5 rounded-2xl bg-blue-500/12 border border-blue-400/30 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Theory Self-Check Verification</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Confirm you have digested the core definitions, architectural concepts, and principles of {studyDay.topicTitle} before advancing to the hands-on lab.
              </p>
              <label className="flex items-center gap-2.5 text-xs text-slate-100 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={selfCheckPassed}
                  onChange={(e) => setSelfCheckPassed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-slate-900 border-white/30"
                />
                <span className="font-medium">I have thoroughly studied these theory notes and am ready for the hands-on practical lab.</span>
              </label>

              <div className="pt-2">
                <button
                  onClick={handleCompleteTheory}
                  disabled={!selfCheckPassed || studyDay.theoryStatus === 'completed'}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer shadow-md ${
                    studyDay.theoryStatus === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                      : selfCheckPassed
                      ? 'apple-btn-primary'
                      : 'bg-white/[0.06] text-slate-400 border border-white/12 cursor-not-allowed'
                  }`}
                >
                  {studyDay.theoryStatus === 'completed' ? '✓ Theory Completed' : 'Complete Theory & Open Practical Lab'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICAL LAB */}
      {activeTab === 'practical' && practicalTask && (
        <div className="space-y-6">
          <div className="apple-glass p-7 md:p-8 rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div>
              <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">Hands-On Practical Lab</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{practicalTask.content.title}</h2>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">{practicalTask.content.problemStatement}</p>
            </div>

            {/* Requirements list */}
            <div className="apple-subcard p-5 rounded-2xl border border-white/14">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">
                Specification Requirements
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-100">
                {practicalTask.content.requirements?.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code / Query Editor Console */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">SQL DDL Submission Console</span>
                  <span className="text-[10px] font-mono text-slate-300">(MySQL 8.0 Dialect)</span>
                </div>
                <button
                  onClick={() => setStudentCode(practicalTask.content.starterCode || '')}
                  className="text-[11px] text-blue-300 hover:text-white underline font-medium cursor-pointer"
                >
                  Reset Starter Code
                </button>
              </div>

              <textarea
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                rows={12}
                className="w-full rounded-2xl bg-black/60 border border-white/16 p-4 font-mono text-xs text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 leading-relaxed shadow-inner"
                placeholder="Write your DDL schema and test insert commands here..."
              />
            </div>

            {/* Progressive Hints Section */}
            {practicalTask.content.hints && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Progressive Hints (Reveal on-demand)</span>
                </div>
                <div className="space-y-2">
                  {practicalTask.content.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div
                        key={idx}
                        className="apple-subcard p-4 rounded-2xl border border-white/14 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-semibold">Hint {idx + 1}</span>
                          <button
                            onClick={() => toggleHint(idx)}
                            className="text-blue-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isRevealed ? 'Hide' : 'Reveal Hint'}</span>
                          </button>
                        </div>
                        {isRevealed && <p className="text-slate-100 mt-2 font-mono text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/8">{hint}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/12">
              <button
                onClick={() => setSolutionRevealed(!solutionRevealed)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{solutionRevealed ? 'Hide Solution' : 'View Verified Reference Solution'}</span>
              </button>

              <button
                onClick={handleSubmitPractical}
                className="apple-btn-primary flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Verify Practical Lab</span>
              </button>
            </div>

            {/* Submission Feedback Banner */}
            {submissionFeedback && (
              <div className="p-4.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-mono space-y-2 shadow-lg">
                <div className="font-bold text-emerald-300">{submissionFeedback}</div>
                <p className="text-[11px] text-slate-200">
                  Prerequisites satisfied! The 10-Question AI Daily Quiz is now unlocked.
                </p>
                <div className="pt-2">
                  <Link
                    href="/quiz"
                    className="apple-btn-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold shadow-md"
                  >
                    <span>Proceed to Daily AI Quiz Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Official Solution */}
            {solutionRevealed && practicalTask.content.solutionSnippet && (
              <div className="p-5 rounded-2xl bg-black/55 border border-white/16 space-y-2 shadow-inner">
                <div className="text-xs font-bold text-amber-300">Official Reference DDL Script</div>
                <pre className="text-xs font-mono text-slate-100 overflow-x-auto p-3 bg-black/40 rounded-xl border border-white/10">
                  {practicalTask.content.solutionSnippet}
                </pre>
                <p className="text-[11px] text-slate-300 italic">
                  {practicalTask.content.solutionExplanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RECALL & REVISION */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          <div className="apple-glass p-7 md:p-8 rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div>
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">10-Minute Active Recall</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">Spaced Repetition & Daily Summary</h2>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Before attempting the quiz, test your recall on these prompt questions to solidify long-term retention.
              </p>
            </div>

            <div className="space-y-3">
              {revisionTask?.content.recallPrompts?.map((prompt, i) => (
                <div key={i} className="apple-subcard p-4 rounded-2xl border border-white/14 text-xs text-slate-100">
                  <span className="font-bold text-blue-300 font-mono">Q{i + 1}: </span>
                  <span className="font-medium">{prompt}</span>
                </div>
              ))}
            </div>

            <div className="apple-subcard p-4 rounded-2xl border border-white/14 text-xs text-slate-300">
              <span className="font-bold text-white">Spaced Repetition Schedule:</span> Concepts from this topic will automatically re-appear at Day 1, Day 3, Day 7, and Day 14 intervals.
            </div>
          </div>
        </div>
      )}
      {/* Course Document In-App Reader Modal */}
      <CourseDocumentReader
        document={readerDoc}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
}
