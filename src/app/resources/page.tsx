'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Table as TableIcon,
  Tag,
  FolderOpen,
  Presentation,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { COURSE_DOCUMENTS, CourseDocument } from '@/lib/constants/course-content';
import { CourseDocumentReader } from '@/components/reader/CourseDocumentReader';

export default function ResourcesPage() {
  const [documents, setDocuments] = useState<CourseDocument[]>(COURSE_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Reader state
  const [activeDocument, setActiveDocument] = useState<CourseDocument | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const handleOpenReader = (doc: CourseDocument) => {
    setActiveDocument(doc);
    setIsReaderOpen(true);
  };

  const handleMarkStudied = (id: string, isStudied: boolean) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isStudied } : d))
    );
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = (file.name.split('.').pop()?.toLowerCase() as any) || 'pdf';
    const newDoc: CourseDocument = {
      id: `custom-${Date.now()}`,
      title: file.name,
      filename: file.name,
      subject: 'Custom Upload',
      type: fileType,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      isStudied: false,
      topicRef: 'Custom Student Notes',
      estimatedReadTimeMins: 10,
      overview: `Uploaded resource: ${file.name}. Parsed and ready for in-app reading.`,
      pages: [
        {
          pageNumber: 1,
          chapterTitle: file.name,
          content: `### ${file.name}\n\nDocument uploaded successfully into StudyOS AI.\n\nFile size: ${(file.size / 1024).toFixed(1)} KB.\n\nYou can highlight text, extract AI notes, and practice quizzes for this study material.`,
          keyHighlights: ['Custom uploaded document for C-DAC BDA preparation.'],
        },
      ],
      aiKeySummary: [
        `Custom study asset: ${file.name}`,
        'Integrated into Harshal\'s personal course library.',
      ],
      practiceQuestions: [
        {
          question: `Have you thoroughly reviewed the core concepts in ${file.name}?`,
          options: ['Yes, fully understood', 'Partially reviewed', 'Need to revise again', 'Not yet'],
          correctIndex: 0,
          explanation: 'Regular active recall solidifies technical comprehension.',
        },
      ],
    };

    setDocuments([newDoc, ...documents]);
    setActiveDocument(newDoc);
    setIsReaderOpen(true);
  };

  const filtered = documents.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.topicRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.overview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || r.subject.includes(selectedSubject) || (selectedSubject === 'Python' && r.subject.includes('Python'));
    const matchesType = selectedType === 'All' || r.type === selectedType;
    return matchesSearch && matchesSubject && matchesType;
  });

  const getBadgeType = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'pptx':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'docx':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'csv':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const studiedCount = documents.filter((d) => d.isStudied).length;
  const progressPercent = Math.round((studiedCount / documents.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="apple-glass-elevated p-8 md:p-10 rounded-[36px] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="apple-glass-pill text-[11px] font-mono font-semibold text-blue-300 px-3 py-1 flex items-center gap-1.5 shadow-sm border border-blue-400/30">
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>C-DAC PGCP-BDA Courseware</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">21 Course Assets • Full In-App Reader</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Notes, Slide Decks & Document Reader
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Read your official C-DAC PGCP-BDA course PPT slides, PDF lecture notes, DOCX handouts, and CSV datasets directly on our site with interactive slides, AI summaries, and comprehension quizzes.
          </p>
        </div>

        {/* Right Action: Upload + Reading Progress */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0 relative z-10">
          <label className="apple-btn-primary flex items-center gap-2 px-6 py-3.5 rounded-2xl cursor-pointer text-xs font-bold shadow-lg">
            <Upload className="w-4 h-4" />
            <span>Upload Course Material</span>
            <input type="file" onChange={handleSimulateUpload} className="hidden" />
          </label>

          {/* Quick Stats Pill */}
          <div className="apple-glass-pill px-4 py-2 rounded-2xl border border-white/14 flex items-center gap-3 text-xs">
            <span className="text-slate-300">Reading Progress:</span>
            <span className="font-bold text-white font-mono">{studiedCount} / {documents.length}</span>
            <span className="text-emerald-400 font-bold font-mono">({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-glass p-4 rounded-3xl border border-white/14 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search slides, notes, queries, topics..."
            className="apple-input w-full pl-9 pr-4 py-2 rounded-2xl text-xs placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Subject Filter */}
          <div className="flex items-center bg-white/[0.06] p-1 rounded-2xl border border-white/10">
            {['All', 'MySQL', 'Python'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedSubject === sub
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {sub === 'All' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-white/[0.06] p-1 rounded-2xl border border-white/10">
            {[
              { label: 'All', val: 'All' },
              { label: 'Slides', val: 'pptx' },
              { label: 'PDFs', val: 'pdf' },
              { label: 'Notes', val: 'docx' },
              { label: 'Datasets', val: 'csv' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setSelectedType(t.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedType === t.val
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          return (
            <div
              key={doc.id}
              className="apple-card p-5 rounded-[28px] border border-white/14 flex flex-col justify-between hover:border-white/30 transition-all duration-200 group relative shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${getBadgeType(
                      doc.type
                    )}`}
                  >
                    {doc.type === 'pptx' ? 'Slide Deck' : doc.type.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{doc.estimatedReadTimeMins}m read</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                  {doc.title}
                </h3>

                {/* Overview preview */}
                <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                  {doc.overview}
                </p>

                {/* Topic link tag */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-300 font-mono font-medium">
                  <Tag className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{doc.topicRef}</span>
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                {/* Studied Toggle */}
                <button
                  onClick={() => handleMarkStudied(doc.id, !doc.isStudied)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                    doc.isStudied
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle studied status"
                >
                  <CheckCircle2 className={`w-4 h-4 ${doc.isStudied ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{doc.isStudied ? 'Studied' : 'Mark Done'}</span>
                </button>

                {/* Open & Read Button */}
                <button
                  onClick={() => handleOpenReader(doc)}
                  className="apple-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm group/btn"
                >
                  <span>{doc.type === 'pptx' ? 'View Slides' : 'Read Document'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="apple-glass p-12 rounded-3xl text-center text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
          <p className="text-sm font-semibold text-white">No documents match the current filter.</p>
          <p className="text-xs text-slate-400">Try selecting &quot;All Subjects&quot; or clearing your search term.</p>
        </div>
      )}

      {/* In-App Course Document & Slide Deck Reader Modal */}
      <CourseDocumentReader
        document={activeDocument}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        onMarkStudied={handleMarkStudied}
      />
    </div>
  );
}
