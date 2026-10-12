'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  FileText,
  Presentation,
  Table as TableIcon,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Clock,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Code2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CourseDocument, SlideItem, DocumentPage } from '@/lib/constants/course-content';

interface CourseDocumentReaderProps {
  document: CourseDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkStudied?: (id: string, isStudied: boolean) => void;
}

export function CourseDocumentReader({
  document,
  isOpen,
  onClose,
  onMarkStudied,
}: CourseDocumentReaderProps) {
  // State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<100 | 125 | 150>(100);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [isStudied, setIsStudied] = useState(false);

  // AI Assistant Tab
  const [activeTab, setActiveTab] = useState<'content' | 'ai-summary' | 'quiz'>('content');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    if (document) {
      setCurrentSlideIndex(0);
      setCurrentPageIndex(0);
      setActiveTab('content');
      setSelectedAnswers({});
      setShowQuizResults(false);
      setIsStudied(document.isStudied);
    }
  }, [document]);

  // Keyboard navigation for slide deck
  useEffect(() => {
    if (!isOpen || !document) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.type === 'pptx' && document.slides) {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
          setCurrentSlideIndex((prev) => Math.min(prev + 1, (document.slides?.length || 1) - 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (document.pages) {
        if (e.key === 'ArrowRight') {
          setCurrentPageIndex((prev) => Math.min(prev + 1, (document.pages?.length || 1) - 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
        }
      }

      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, document, isFullscreen, onClose]);

  if (!isOpen || !document) return null;

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleToggleStudied = () => {
    const next = !isStudied;
    setIsStudied(next);
    if (onMarkStudied) onMarkStudied(document.id, next);
  };

  const currentSlide: SlideItem | undefined = document.slides?.[currentSlideIndex];
  const currentPage: DocumentPage | undefined = document.pages?.[currentPageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      {/* Outer Modal Container */}
      <div
        className={`w-full bg-[#0a0d17]/95 border border-white/20 rounded-[32px] shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 rounded-none border-none' : 'max-w-5xl h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 sm:px-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-black/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl apple-glass border border-white/14 flex items-center justify-center text-blue-400 shrink-0">
              {document.type === 'pptx' && <Presentation className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
              {document.type === 'pdf' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
              {document.type === 'docx' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
              {document.type === 'csv' && <TableIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {document.type.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate">{document.subject}</span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">• {document.size}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">{document.title}</h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-white/[0.06] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'content'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setActiveTab('ai-summary')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'ai-summary'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>AI Summary</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Quiz</span>
              </button>
            </div>

            {/* Mark Studied Pill */}
            <button
              onClick={handleToggleStudied}
              className={`apple-glass-pill hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                isStudied
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isStudied ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isStudied ? 'Studied' : 'Mark as Studied'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="apple-glass-pill p-2 rounded-2xl text-slate-300 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="apple-glass-pill p-2 rounded-2xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
              title="Close Reader (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          {/* TAB 1: MAIN DOCUMENT CONTENT */}
          {activeTab === 'content' && (
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
              {/* PPTX PRESENTATION SLIDE MODE */}
              {document.type === 'pptx' && document.slides && currentSlide && (
                <div className="flex flex-col h-full space-y-6">
                  {/* Presentation Slide Canvas */}
                  <div className="flex-1 rounded-3xl apple-glass-elevated border border-white/20 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                    {/* Background slide ambient glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                    {/* Slide Header */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-300 font-mono mb-2">
                        <span className="uppercase tracking-wider font-semibold">C-DAC PGCP-BDA Technical Slide Deck</span>
                        <span className="bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                          Slide {currentSlide.slideNumber} of {document.slides.length}
                        </span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{currentSlide.title}</h1>
                      {currentSlide.subtitle && (
                        <p className="text-xs md:text-sm text-slate-300 font-medium mt-1">{currentSlide.subtitle}</p>
                      )}
                    </div>

                    {/* Slide Main Content */}
                    <div className="my-6 space-y-4">
                      {/* Bullet points */}
                      <ul className="space-y-2.5">
                        {currentSlide.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_8px_#f59e0b]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Code Snippet if present */}
                      {currentSlide.codeSnippet && (
                        <div className="mt-4 rounded-2xl bg-black/60 border border-white/14 p-4 relative group">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                            <span>Code Reference / SQL Syntax</span>
                            <button
                              onClick={() => handleCopyCode(currentSlide.codeSnippet!, 0)}
                              className="flex items-center gap-1 text-slate-300 hover:text-white text-[11px] transition"
                            >
                              {copiedCodeIndex === 0 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeIndex === 0 ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {currentSlide.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Slide Footer: Speaker Notes & Key Exam Takeaway */}
                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <span className="font-bold text-slate-300 block mb-0.5 text-[11px]">Instructor Notes:</span>
                        <p className="text-slate-400 text-[11px]">{currentSlide.speakerNotes}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/25">
                        <span className="font-bold text-amber-300 block mb-0.5 text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>Exam Takeaway:</span>
                        </span>
                        <p className="text-amber-200 text-[11px]">{currentSlide.keyTakeaway}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide Carousel Thumbnails & Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentSlideIndex === 0}
                      className="apple-btn-secondary px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Slide</span>
                    </button>

                    {/* Thumbnail Dots / Badges */}
                    <div className="flex items-center gap-1.5 overflow-x-auto px-2">
                      {document.slides.map((s, idx) => (
                        <button
                          key={s.slideNumber}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-7 h-7 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                            idx === currentSlideIndex
                              ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {s.slideNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, document.slides!.length - 1))}
                      disabled={currentSlideIndex === document.slides.length - 1}
                      className="apple-btn-primary px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <span>Next Slide</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PDF & DOCX MULTI-PAGE DOCUMENT MODE */}
              {(document.type === 'pdf' || document.type === 'docx') && document.pages && currentPage && (
                <div className="flex flex-col h-full space-y-6">
                  {/* Document Reading Page Container */}
                  <div className="flex-1 rounded-3xl apple-glass-elevated border border-white/20 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    {/* Top Page Breadcrumb & Zoom */}
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">Chapter / Page:</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg font-mono">
                          Page {currentPage.pageNumber} of {document.pages.length}
                        </span>
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setZoomLevel((prev) => (prev > 100 ? ((prev - 25) as any) : 100))}
                          className="p-1 rounded-lg hover:text-white text-slate-400 transition"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-mono px-1.5 text-slate-300 font-bold">{zoomLevel}%</span>
                        <button
                          onClick={() => setZoomLevel((prev) => (prev < 150 ? ((prev + 25) as any) : 150))}
                          className="p-1 rounded-lg hover:text-white text-slate-400 transition"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Header */}
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-4">
                      {currentPage.chapterTitle}
                    </h1>

                    {/* Page Content with dynamic zoom styling */}
                    <div
                      className="space-y-4 text-slate-200 leading-relaxed font-sans"
                      style={{ fontSize: `${zoomLevel}%` }}
                    >
                      <div className="whitespace-pre-line text-xs sm:text-sm text-slate-300">
                        {currentPage.content}
                      </div>

                      {/* Code blocks if any */}
                      {currentPage.codeBlocks?.map((cb, idx) => (
                        <div key={idx} className="my-4 rounded-2xl bg-black/70 border border-white/14 p-4 relative group">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                            <span>{cb.explanation || `${cb.language.toUpperCase()} Example`}</span>
                            <button
                              onClick={() => handleCopyCode(cb.code, idx)}
                              className="flex items-center gap-1 text-slate-300 hover:text-white text-[11px] transition"
                            >
                              {copiedCodeIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeIndex === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {cb.code}
                          </pre>
                        </div>
                      ))}

                      {/* Key Highlights Callout */}
                      {currentPage.keyHighlights?.length > 0 && (
                        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/25">
                          <span className="font-bold text-blue-300 text-xs block mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            <span>Key Takeaways for Examination:</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-blue-200">
                            {currentPage.keyHighlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-page Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                      onClick={() => setCurrentPageIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPageIndex === 0}
                      className="apple-btn-secondary px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Page</span>
                    </button>

                    <span className="text-xs font-mono text-slate-400">
                      Reading {currentPageIndex + 1} of {document.pages.length}
                    </span>

                    <button
                      onClick={() => setCurrentPageIndex((prev) => Math.min(prev + 1, document.pages!.length - 1))}
                      disabled={currentPageIndex === document.pages.length - 1}
                      className="apple-btn-primary px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <span>Next Page</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* CSV DATASET TABLE MODE */}
              {document.type === 'csv' && document.csvData && (
                <div className="space-y-6">
                  <div className="p-4 rounded-3xl apple-glass-elevated border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white">Dataset Records Preview ({document.csvData.rows.length} Rows)</h3>
                        <p className="text-xs text-slate-400">Schema benchmark for SQL queries and Pandas analytics.</p>
                      </div>
                      <span className="apple-glass-pill px-3 py-1 rounded-full text-xs font-mono text-emerald-300 border border-emerald-400/30">
                        {document.csvData.columns.length} Attributes
                      </span>
                    </div>

                    {/* Interactive Table */}
                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-white/10 text-slate-200">
                          <tr>
                            {document.csvData.columns.map((col) => (
                              <th key={col} className="p-3 font-semibold border-b border-white/10">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {document.csvData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.05] transition">
                              {document.csvData!.columns.map((col) => (
                                <td key={col} className="p-3 text-slate-300">
                                  {String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sample SQL and Pandas Prompts on this dataset */}
                  <div className="p-4 rounded-3xl apple-glass border border-white/14">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>Ready-to-Run Queries for this Dataset:</span>
                    </h4>
                    <div className="space-y-2">
                      {document.csvData.sampleQueries.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
                          <code className="text-xs font-mono text-emerald-300 truncate">{q}</code>
                          <button
                            onClick={() => handleCopyCode(q, idx)}
                            className="text-xs text-slate-400 hover:text-white shrink-0 flex items-center gap-1"
                          >
                            {copiedCodeIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI SUMMARY & SYNTHESIS */}
          {activeTab === 'ai-summary' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl apple-glass-elevated border border-purple-500/30 bg-purple-950/20 shadow-xl">
                <div className="flex items-center gap-2.5 text-purple-300 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-bold text-base text-white">AI Technical Synthesis</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {document.overview}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                    Essential Concept Takeaways:
                  </h4>
                  {document.aiKeySummary.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading Stats Card */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-2xl apple-glass border border-white/14">
                  <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-400 block">Est. Study Time</span>
                  <span className="font-bold text-white text-sm font-mono">{document.estimatedReadTimeMins} mins</span>
                </div>
                <div className="p-4 rounded-2xl apple-glass border border-white/14">
                  <BookOpen className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-400 block">Topic Link</span>
                  <span className="font-bold text-white text-xs truncate block">{document.topicRef}</span>
                </div>
                <div className="p-4 rounded-2xl apple-glass border border-white/14">
                  <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-300 text-xs">{isStudied ? 'Studied' : 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT PRACTICE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl apple-glass-elevated border border-emerald-500/30 bg-emerald-950/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">Instant Document Comprehension Check</h3>
                  </div>
                  <span className="text-xs text-slate-300 font-mono">
                    {document.practiceQuestions.length} Questions
                  </span>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {document.practiceQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                      <p className="text-xs font-semibold text-white">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let optionClass = 'bg-white/[0.05] border-white/10 text-slate-300 hover:bg-white/[0.1]';
                          if (showQuizResults) {
                            if (isCorrect) {
                              optionClass = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'bg-rose-500/20 border-rose-400/50 text-rose-200';
                            }
                          } else if (isSelected) {
                            optionClass = 'bg-blue-500/25 border-blue-400/40 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!showQuizResults) {
                                  setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
                                }
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${optionClass}`}
                            >
                              <span>{opt}</span>
                              {showQuizResults && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResults && (
                        <div className="mt-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 leading-relaxed">
                          <span className="font-bold text-emerald-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Check Answers Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Answered {Object.keys(selectedAnswers).length} / {document.practiceQuestions.length}
                  </span>
                  <button
                    onClick={() => setShowQuizResults(true)}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="apple-btn-primary px-6 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer disabled:opacity-40"
                  >
                    Check Answers
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
