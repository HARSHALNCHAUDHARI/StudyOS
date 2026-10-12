'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { PreloadedSubjectData, UserProfile, StudyDay } from '@/types';

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
  'Why did I get question 4 wrong on today’s constraints quiz?',
];

export default function StudyCoachPage() {
  const [profile, setProfile] = useState<UserProfile>(StorageManager.getUserProfile());
  const [today, setToday] = useState<StudyDay | null>(null);
  const [curriculum, setCurriculum] = useState<PreloadedSubjectData[]>([]);

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
      text: `Hello Harshal! I am your **StudyOS AI Mentor** for the C-DAC PGCP-BDA programme.\n\nYour **150-Day Sprint** is active. You are on **Day ${today?.dayNumber || 1}** focusing on **${today?.topicTitle || 'File Systems vs DBMS & Relational Architecture'}** (${today?.subjectTitle || 'MySQL / DBMS'}). Complete your theory and practical lab to unlock today's AI quiz.\n\nHow can I guide your preparation today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
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
        time: 'Just now',
      };
      setMessages((prev) => [...prev, coachReply]);
    } catch (e) {
      console.error('Coach communication error:', e);
      const fallbackReply: Message = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: 'Review today’s practical lab on MySQL constraints and ensure child tables declare identical data types with their referenced parent primary keys!',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="apple-glass-elevated p-6 md:p-8 rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg ring-1 ring-white/25">
            <Sparkles className="w-6 h-6 text-purple-200 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Intelligent AI Study Coach</h1>
            <p className="text-xs text-slate-200 mt-0.5">Personalized mentor grounded in your actual syllabus and assessment history.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-mono text-purple-200 border border-purple-400/35">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span>Active Mentor</span>
        </div>
      </div>

      {/* Suggested Prompts Pill Carousel in Apple Style */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-300 uppercase font-semibold">Suggested Mentor Prompts:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="apple-glass-pill px-4 py-2 rounded-full text-xs text-slate-200 hover:text-white hover:bg-white/[0.14] whitespace-nowrap transition cursor-pointer shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="apple-glass rounded-[28px] border border-white/18 p-6 md:p-8 min-h-[460px] flex flex-col justify-between space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[24px] p-4.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'apple-btn-primary text-white font-medium shadow-md'
                    : 'apple-subcard border-white/16 text-slate-100 font-mono whitespace-pre-wrap shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 font-mono p-3">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              <span>StudyOS Coach is analyzing your syllabus & generating advice...</span>
            </div>
          )}
        </div>

        {/* Input Form with Apple Glass Styling */}
        <div className="pt-4 border-t border-white/12 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your coach anything about syllabus, weak topics, or viva preparation..."
            className="apple-input flex-1 rounded-full px-5 py-3.5 text-xs placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="apple-btn-primary p-3.5 rounded-full disabled:opacity-40 transition cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
