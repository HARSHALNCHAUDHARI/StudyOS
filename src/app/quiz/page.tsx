'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { StudyDay, QuizQuestion, QuizAttempt } from '@/types';
import { gradeQuiz } from '@/lib/assessment/scoring';

export default function QuizArenaPage() {
  const [studyDay, setStudyDay] = useState<StudyDay | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    attempt: QuizAttempt;
    remediationAdvice: string;
    weakQuestionIds: string[];
  } | null>(null);

  // 15-minute timer
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const day = StorageManager.getTodayStudyDay();
    setStudyDay(day);

    if (day?.quiz?.questions && day.quiz.questions.length > 0) {
      setQuestions(day.quiz.questions);
      setTimerActive(true);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0 && !quizResult) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizResult) {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, quizResult]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (quizResult) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!studyDay || questions.length === 0) return;
    setIsSubmitting(true);

    try {
      const result = gradeQuiz({
        quizId: studyDay.quiz?.id || 'quiz-day-03',
        userId: studyDay.userId,
        questions,
        responses: selectedAnswers,
        passThreshold: 80,
      });

      StorageManager.saveQuizAttempt(result.attempt);

      if (result.attempt.passed) {
        StorageManager.updateStudyDay(studyDay.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });

        const profile = StorageManager.getUserProfile();
        const newStreak = profile.currentStreak + 1;
        StorageManager.updateUserProfile({
          currentStreak: newStreak,
          longestStreak: Math.max(profile.longestStreak, newStreak),
        });

        // Mark corresponding topic complete in curriculum
        const theoryTask = studyDay.tasks?.find((t) => t.taskType === 'theory');
        const topicId = theoryTask?.topicId || studyDay.quiz?.topicId || 'top-sql-1';
        StorageManager.updateTopic(topicId, {
          isCompleted: true,
          masteryStatus: 'mastered',
          quizScore: result.attempt.percentage,
        });

        // Automatically schedule spaced repetition for Day 1 concept
        StorageManager.scheduleNewRevision(
          studyDay.topicTitle || 'File Systems vs DBMS & Relational Architecture',
          studyDay.subjectTitle || 'MySQL / DBMS',
          studyDay.subjectId || 'sub-mysql',
          topicId,
          result.attempt.percentage
        );

        // Add congratulations notification
        StorageManager.addNotification({
          userId: studyDay.userId,
          title: `Day ${studyDay.dayNumber} Cleared! 🎉 (${result.attempt.percentage}%)`,
          message: `Outstanding job! You scored ${result.attempt.percentage}% on ${studyDay.topicTitle}. Streak extended to ${newStreak} days.`,
          type: 'streak_alert',
          isRead: false,
          actionUrl: '/today',
        });
      } else {
        StorageManager.updateStudyDay(studyDay.id, {
          status: 'needs_revision',
        });
      }

      setQuizResult(result);
      setTimerActive(false);
    } catch (e) {
      console.error('Quiz submission error:', e);
      alert('Error grading quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRetryQuiz = async () => {
    if (!studyDay) return;
    setIsRetrying(true);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: studyDay.topicTitle,
          subjectTitle: studyDay.subjectTitle,
          learningObjectives: ['Table constraints', 'Data types', 'Cascading foreign keys'],
          weakAreas: ['Foreign key constraint errors', 'CHECK condition evaluation with NULL'],
        }),
      });

      const data = await res.json();
      if (data?.quiz?.questions) {
        setQuestions(data.quiz.questions);
        setSelectedAnswers({});
        setQuizResult(null);
        setCurrentIndex(0);
        setTimeLeft(15 * 60);
        setTimerActive(true);
      }
    } catch (e) {
      console.error('Retry generation error:', e);
      alert('Failed to generate retry quiz. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (!studyDay) {
    return <div className="text-center p-12 text-slate-400">Loading quiz arena...</div>;
  }

  const currentQ = questions[currentIndex];
  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Quiz Top Header in Apple Glass */}
      {/* Top Header Card with Apple Liquid Glass */}
      <div className="apple-glass-elevated p-5 sm:p-7 md:p-8 rounded-[28px] sm:rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="apple-glass-pill text-xs font-mono font-bold text-purple-200 px-3 py-1 rounded-full border border-purple-400/35 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
              <span>AI Quiz Arena</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">10 Questions • Pass: 80%</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            {studyDay.topicTitle} Assessment
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Subject: <strong className="text-white font-semibold">{studyDay.subjectTitle}</strong>
          </p>
        </div>

        {/* Quiz Timer in Apple Frosted Pill */}
        <div className="apple-glass-pill flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 shadow-md self-start sm:self-auto">
          <Clock className={`w-5 h-5 ${timeLeft < 180 ? 'text-rose-400 animate-pulse' : 'text-purple-300'}`} />
          <div className="font-mono">
            <div className={`text-lg sm:text-xl font-extrabold ${timeLeft < 180 ? 'text-rose-400' : 'text-white'}`}>
              {formatTimer(timeLeft)}
            </div>
            <div className="text-[10px] text-slate-300 leading-none mt-0.5 font-medium">Time Remaining</div>
          </div>
        </div>
      </div>

      {/* RESULT VIEW (If graded) */}
      {quizResult && (
        <div className="space-y-6">
          <div className={`apple-glass-elevated p-8 rounded-[30px] border backdrop-blur-3xl shadow-2xl ${
            quizResult.attempt.passed
              ? 'bg-emerald-500/15 border-emerald-400/40'
              : 'bg-rose-500/15 border-rose-400/40'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-bold text-2xl font-mono shadow-md ${
                  quizResult.attempt.passed
                    ? 'apple-glass-pill bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                    : 'apple-glass-pill bg-rose-500/25 text-rose-200 border border-rose-400/50'
                }`}>
                  {quizResult.attempt.percentage}%
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {quizResult.attempt.passed ? (
                      <>
                        <span>Assessment Passed! 🎉</span>
                        <ShieldCheck className="w-5 h-5 text-[#30d158]" />
                      </>
                    ) : (
                      <>
                        <span>Threshold Not Met</span>
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                    {quizResult.remediationAdvice}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {quizResult.attempt.passed ? (
                  <Link
                    href="/"
                    className="apple-btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold cursor-pointer shadow-lg w-full md:w-auto"
                  >
                    <span>Return to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={handleGenerateRetryQuiz}
                    disabled={isRetrying}
                    className="apple-btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold cursor-pointer shadow-lg w-full md:w-auto"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Generating Retry...' : 'Take Targeted Retry Quiz'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION PALETTE & CAROUSEL */}
      {currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Panel (3 cols) */}
          <div className="lg:col-span-3 apple-glass p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/12">
              <span className="text-xs font-mono font-bold text-blue-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="apple-glass-pill text-[10px] font-mono uppercase px-2.5 py-1 rounded-full text-slate-200 font-semibold">
                {currentQ.difficulty} • {currentQ.marks} Mark
              </span>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {currentQ.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                const isCorrect = currentQ.correctAnswer === opt.id;
                const isGraded = !!quizResult;

                let optionStyles = 'apple-subcard border-white/14 text-slate-100 hover:bg-white/[0.1] hover:border-white/28';

                if (isGraded) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-500/25 border-emerald-400/60 text-emerald-100 font-semibold shadow-[0_0_20px_rgba(48,209,88,0.3)]';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-500/25 border-rose-400/60 text-rose-100 font-semibold shadow-[0_0_20px_rgba(255,69,58,0.3)]';
                  }
                } else if (isSelected) {
                  optionStyles = 'bg-gradient-to-r from-blue-600/35 to-indigo-600/25 border-blue-400/60 text-white font-semibold shadow-[0_4px_20px_rgba(10,132,255,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    disabled={isGraded}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs transition flex items-center justify-between cursor-pointer gap-2 ${optionStyles}`}
                  >
                    <span>{opt.text}</span>
                    {isGraded && (
                      <div className="shrink-0">
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-[#30d158]" />}
                        {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation View (If graded) */}
            {quizResult && (
              <div className="apple-subcard p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/16 space-y-2 mt-4 shadow-inner">
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>C-DAC Explanation & Rationale</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/12">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="apple-btn-secondary flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs font-mono text-slate-300 font-semibold order-last sm:order-none w-full sm:w-auto text-center">
                {totalAnswered} of {questions.length} Answered
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="apple-btn-primary flex items-center gap-1 px-5 py-2 rounded-full text-xs font-bold cursor-pointer shadow-md"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                !quizResult && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting || totalAnswered < questions.length}
                    className="apple-btn-primary px-6 py-2 rounded-full text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-lg"
                  >
                    {isSubmitting ? 'Grading Answers...' : 'Submit Assessment'}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Question Grid Navigator (1 col) */}
          <div className="apple-glass p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-white/18 flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div>
              <h3 className="text-xs font-bold text-white mb-3">Question Palette</h3>
              <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!selectedAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isGraded = !!quizResult;
                  const isCorrect = isGraded && selectedAnswers[q.id] === q.correctAnswer;

                  let btnStyle = 'apple-subcard text-slate-200 border-white/12';

                  if (isGraded) {
                    btnStyle = isCorrect ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-sm' : 'bg-rose-500/25 text-rose-200 border-rose-400/50 shadow-sm';
                  } else if (isCurrent) {
                    btnStyle = 'apple-btn-primary text-white font-bold shadow-md';
                  } else if (isAnswered) {
                    btnStyle = 'bg-white/[0.18] text-white border-white/30 font-bold shadow-sm';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/12 text-[11px] text-slate-300 space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-white/[0.22] border border-white/30" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-white/[0.06] border border-white/14" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
