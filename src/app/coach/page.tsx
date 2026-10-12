'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Zap,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { PreloadedSubjectData, UserProfile, StudyDay } from '@/types';
import { CoachMessageRenderer } from '@/components/coach/CoachMessageRenderer';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

const SUGGESTED_PROMPTS = [
  'What should I prioritize in my study session today?',
  'Explain why financial calculations require DECIMAL instead of FLOAT in MySQL.',
  'Am I on track to complete the C-DAC syllabus before final exams?',
  'Give me 3 high-yield viva questions on Python OOP and MRO.',
  'Explain the difference between ON DELETE CASCADE and RESTRICT.',
];

export default function StudyCoachPage() {
  const [profile, setProfile] = useState<UserProfile>(StorageManager.getUserProfile());
  const [today, setToday] = useState<StudyDay | null>(null);
  const [curriculum, setCurriculum] = useState<PreloadedSubjectData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProfile(StorageManager.getUserProfile());
    setToday(StorageManager.getTodayStudyDay());
    setCurriculum(StorageManager.getCurriculum());
  }, []);

  const completedTopics = curriculum.reduce(
    (acc: number, s: PreloadedSubjectData) =>
      acc + s.modules.reduce((mAcc: number, m) => mAcc + m.topics.filter((t) => t.isCompleted).length, 0),
    0
  );
  const totalTopics = curriculum.reduce(
    (acc: number, s: PreloadedSubjectData) =>
      acc + s.modules.reduce((mAcc: number, m) => mAcc + m.topics.length, 0),
    0
  );

  const daysRemaining = profile?.targetExamDate
    ? Math.max(0, Math.ceil((new Date(profile.targetExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 150;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'coach',
      text: `### 👋 Welcome Harshal! StudyOS AI Mentor Standing By.

Your **150-Day Sprint** is active. You are on **Day ${today?.dayNumber || 1}** focusing on **${today?.topicTitle || 'File Systems vs DBMS & Relational Architecture'}** (${today?.subjectTitle || 'MySQL / DBMS'}).

Complete your 50m theory and 60m practical lab to unlock today's AI quiz arena.

How can I guide your preparation or clarify concepts today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTopics,
          totalTopics,
          weakTopics: ['Relational Architecture', 'ANSI/SPARC 3-tier model'],
          streak: profile.currentStreak,
          daysRemaining,
          latestScore: 0,
          userQuery: query,
        }),
      });

      const data = await res.json();
      const coachReply: Message = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: data.advice || 'Keep pushing! Consistency across daily 120-minute sessions is the key to mastering big data analytics.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachReply]);
    } catch (e) {
      console.error('Coach communication error:', e);
      const fallbackReply: Message = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: `### 💡 Quick Mentorship Checkpoint
Review today’s practical lab on **MySQL constraints** and ensure child tables declare identical data types with their referenced parent primary keys!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Header Banner with Apple Glass */}
      <div className="apple-glass-elevated p-5 sm:p-7 md:p-8 rounded-[26px] sm:rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg ring-1 ring-white/25 shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">Intelligent AI Study Coach</h1>
              <span className="apple-glass-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono text-purple-300 font-bold border border-purple-400/35 uppercase">
                Sprint Active
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
              Personalized mentor grounded in your C-DAC PGCP-BDA syllabus, daily metrics, and assessment history.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto">
          <div className="apple-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-purple-200 border border-purple-400/35 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Online Mentor</span>
          </div>
          <div className="apple-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Day {today?.dayNumber || 1} / 150</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono text-slate-300 uppercase font-semibold tracking-wider">
            Suggested Mentor Prompts
          </span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="apple-glass-pill px-3.5 sm:px-4 py-2 rounded-full text-xs text-slate-200 hover:text-white hover:bg-white/[0.14] whitespace-nowrap transition cursor-pointer shadow-sm border border-white/16 hover:border-white/30"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="apple-glass rounded-[24px] sm:rounded-[32px] border border-white/18 p-4 sm:p-6 md:p-8 min-h-[500px] flex flex-col justify-between space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Messages Scroll Area */}
        <div className="space-y-6 overflow-y-auto max-h-[520px] pr-2">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender badge */}
                <div className="flex items-center gap-2 px-1 text-[11px] text-slate-300 font-medium">
                  {isUser ? (
                    <>
                      <span>Harshal (Student)</span>
                      <div className="w-5 h-5 rounded-full bg-blue-500/25 border border-blue-400/40 flex items-center justify-center text-blue-300">
                        <User className="w-3 h-3" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-purple-500/25 border border-purple-400/40 flex items-center justify-center text-purple-300">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="text-purple-300 font-semibold">StudyOS AI Mentor</span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">• {m.time}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-[26px] ${
                    isUser
                      ? 'apple-btn-primary px-5 py-3.5 text-xs text-white font-medium max-w-xl shadow-lg border border-white/20'
                      : 'apple-subcard bg-white/[0.06] border-white/18 p-5 md:p-6 text-xs text-slate-100 max-w-3xl shadow-md'
                  }`}
                >
                  {isUser ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <CoachMessageRenderer content={m.text} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 p-4 rounded-2xl apple-subcard max-w-lg animate-pulse border border-purple-500/30 bg-purple-500/10">
              <div className="w-7 h-7 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-purple-200">StudyOS Coach is synthesizing guidance...</p>
                <p className="text-[11px] text-slate-300">Analyzing C-DAC PGCP-BDA technical syllabus, code patterns, and viva tips.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form with Sleek Floating Apple Glass */}
        <div className="pt-4 border-t border-white/14">
          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 p-1.5 sm:p-2 rounded-full border border-white/18 shadow-inner backdrop-blur-2xl">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything (e.g. 'Why DECIMAL over FLOAT?', Python MRO, SQL joins)..."
              className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none font-medium min-w-0"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="apple-btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-md shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="hidden sm:flex items-center justify-between px-3 mt-2 text-[10px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Enter</kbd> to ask your coach</span>
            <span>Grounded in C-DAC BDA Curriculum & IEEE Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
