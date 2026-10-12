'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { RevisionItem } from '@/types';

export default function RevisionCentrePage() {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [activeItem, setActiveItem] = useState<RevisionItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const revs = StorageManager.getRevisions();
    setRevisions(revs);
    if (revs.length > 0) {
      setActiveItem(revs[0]);
    }
  }, []);

  const handleAdvanceRevision = (revId: string) => {
    StorageManager.completeRevision(revId);
    const updated = StorageManager.getRevisions();
    setRevisions(updated);
    setShowAnswer(false);
    const nextUncompleted = updated.find((r) => !r.isCompleted);
    setActiveItem(nextUncompleted || null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="apple-glass p-5 sm:p-7 md:p-8 rounded-[26px] sm:rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="apple-glass-pill text-[11px] font-mono font-semibold text-purple-300 px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Spaced Repetition</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">1, 3, 7 & 14 Day Intervals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Revision Centre & Memory Consolidation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-2xl">
            Combat the forgetting curve. Review weak concepts and past study milestones automatically scheduled by AI.
          </p>
        </div>

        <div className="flex items-center gap-3 apple-subcard px-5 py-3 rounded-2xl text-xs font-mono shadow-sm self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-slate-300 font-medium">Queue:</span>
          <span className="font-bold text-white text-sm">{revisions.filter((r) => !r.isCompleted).length} Due</span>
        </div>
      </div>

      {/* Main Grid: Active Recall Flashcard & Schedule Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Recall Card (2 cols) */}
        <div className="lg:col-span-2 apple-glass p-5 sm:p-7 rounded-[26px] sm:rounded-3xl space-y-6 flex flex-col justify-between">
          {activeItem ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                <span className="apple-glass-pill text-[11px] font-mono text-blue-300 font-bold uppercase px-3 py-1 self-start sm:self-auto">
                  {activeItem.subjectTitle} • Stage {activeItem.stage} ({activeItem.intervalDays}-Day Interval)
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Last Quiz: <strong className="text-emerald-400 font-bold">{activeItem.lastScore}%</strong>
                </span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wide">Target Concept</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{activeItem.topicTitle}</h2>
              </div>

              {/* Recall Prompt */}
              <div className="p-5 sm:p-6 rounded-2xl apple-subcard space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Active Recall Challenge</span>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  Explain the precise architectural difference between Super Keys and Candidate Keys, and describe how MySQL InnoDB handles clustered indexing when no primary key is explicitly provided.
                </p>
              </div>

              {/* Reveal Explanation Toggle */}
              {showAnswer ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3 font-mono text-xs text-slate-200 leading-relaxed animate-fadeIn backdrop-blur-xl">
                  <div className="font-bold text-emerald-400 text-sm">Key Recall Points:</div>
                  <ul className="space-y-2.5 list-disc pl-5 text-xs text-slate-300">
                    <li>A Candidate Key is a minimal super key containing no extraneous attributes.</li>
                    <li>A Super Key uniquely identifies a row, but may contain extra non-essential columns.</li>
                    <li>InnoDB automatically picks the first non-null UNIQUE index as the clustered index; if none exists, it generates an internal 6-byte row ID.</li>
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-4 rounded-2xl apple-subcard text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Show Verified Solution & Key Points</span>
                </button>
              )}

              {/* Self-Rating & Advance Stage */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition text-center sm:text-left"
                >
                  {showAnswer ? 'Hide Solution' : 'View Solution'}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAdvanceRevision(activeItem.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Recalled Successfully (Advance to Next Interval)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="font-bold text-white text-lg">Revision Queue Ready!</div>
              <p className="text-xs text-slate-300">Complete Day 1&apos;s daily assessment quiz to automatically schedule your first spaced repetition checkpoint.</p>
            </div>
          )}
        </div>

        {/* Schedule Queue Sidebar (1 col) */}
        <div className="apple-glass p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider px-2">Spaced Repetition Queue</h3>
          <div className="space-y-2.5">
            {revisions.map((r) => {
              const isSelected = activeItem?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveItem(r);
                    setShowAnswer(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border text-xs transition backdrop-blur-md ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-200 shadow-md ring-1 ring-blue-400/30'
                      : r.isCompleted
                      ? 'bg-white/[0.02] border-white/5 opacity-50'
                      : 'apple-subcard text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-blue-300">
                      Stage {r.stage} ({r.intervalDays}d)
                    </span>
                    {r.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <h4 className="font-bold text-white line-clamp-1 text-sm">{r.topicTitle}</h4>
                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{r.subjectTitle}</span>
                    <span className="font-mono text-slate-300 font-medium">Due: {r.nextRevisionDate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
