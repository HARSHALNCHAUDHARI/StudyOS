'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Database,
  FileCode,
  BarChart2,
  Coffee,
  CheckCircle2,
  Clock,
  Layers,
  Edit2,
  X,
} from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { PreloadedSubjectData, Topic } from '@/types';
import { COURSE_DOCUMENTS, CourseDocument } from '@/lib/constants/course-content';
import { CourseDocumentReader } from '@/components/reader/CourseDocumentReader';

export default function SubjectsPage() {
  const [curriculum, setCurriculum] = useState<PreloadedSubjectData[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-mysql');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-sql-1': true,
    'mod-sql-2': true,
  });

  // In-app Reader state
  const [selectedReaderDoc, setSelectedReaderDoc] = useState<CourseDocument | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Modal state: Add new subject
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');

  // Modal state: Edit Topic
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const data = StorageManager.getCurriculum();
    setCurriculum(data);
  }, []);

  const selectedData = curriculum.find((c) => c.subject.id === selectedSubjectId) || curriculum[0];

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-5 h-5 text-sky-400" />;
      case 'FileCode':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5 text-amber-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-orange-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-sky-400" />;
    }
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim() || !newSubjectCode.trim()) return;

    const newSubId = `sub-${Date.now()}`;
    const newSubject = {
      id: newSubId,
      title: newSubjectTitle,
      code: newSubjectCode,
      description: newSubjectDesc,
      icon: 'BookOpen',
      isCustom: true,
      modulesCount: 1,
      topicsCount: 1,
      completedTopicsCount: 0,
      overallMastery: 0,
    };

    const initialMod = {
      id: `mod-${Date.now()}`,
      subjectId: newSubId,
      title: 'Module 1: Foundations',
      sequenceOrder: 1,
      description: 'Foundational concepts and practice',
      topics: [
        {
          id: `top-${Date.now()}`,
          moduleId: `mod-${Date.now()}`,
          subjectId: newSubId,
          title: 'Introduction & Setup',
          difficulty: 'easy' as const,
          durationMins: 60,
          theoryObjectives: ['Understand architectural prerequisites'],
          practicalObjectives: ['Initialize local workspace and verify dependencies'],
          prerequisites: [],
          masteryStatus: 'not_started' as const,
        },
      ],
    };

    StorageManager.addSubject(newSubject, [initialMod]);
    const updated = StorageManager.getCurriculum();
    setCurriculum(updated);
    setSelectedSubjectId(newSubId);
    setShowAddSubjectModal(false);
    setNewSubjectTitle('');
    setNewSubjectCode('');
    setNewSubjectDesc('');
  };

  const handleSaveTopicEdit = () => {
    if (!editingTopic) return;
    StorageManager.updateTopic(editingTopic.id, editingTopic);
    setCurriculum(StorageManager.getCurriculum());
    setEditingTopic(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="apple-glass-elevated p-5 sm:p-7 md:p-8 rounded-[28px] sm:rounded-[30px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="apple-glass-pill text-xs font-mono font-bold text-blue-200 px-3 py-1 rounded-full border border-blue-400/35">
              Syllabus Manager
            </span>
            <span className="text-xs text-slate-300 font-mono">C-DAC PGCP-BDA Courseware</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Curriculum & Module Explorer
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Every subject, module, topic, and learning objective is database-stored and customizable.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="apple-btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-lg w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subject</span>
        </button>
      </div>

      {/* Subject Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {curriculum.map((subData) => {
          const sub = subData.subject;
          const isSelected = sub.id === selectedSubjectId;

          const totalTopics = subData.modules.reduce((a, m) => a + m.topics.length, 0);
          const doneTopics = subData.modules.reduce(
            (a, m) => a + m.topics.filter((t) => t.isCompleted).length,
            0
          );
          const pct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`p-6 rounded-[28px] border text-left transition flex flex-col justify-between cursor-pointer shadow-[0_12px_36px_rgba(0,0,0,0.38)] ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-purple-600/15 border-blue-400/50 shadow-[0_8px_30px_rgba(10,132,255,0.25),inset_0_1px_0_rgba(255,255,255,0.3)]'
                  : 'apple-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl apple-subcard">
                    {getSubjectIcon(sub.icon)}
                  </div>
                  <span className="apple-glass-pill text-[10px] font-mono font-bold text-slate-200 uppercase px-2.5 py-1 rounded-full">
                    {sub.code}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{sub.title}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-1 leading-relaxed">{sub.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/12">
                <div className="flex items-center justify-between text-[11px] text-slate-200 mb-1.5 font-medium">
                  <span>Coverage</span>
                  <span className="font-mono text-white font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/14">
                  <div className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Module & Topic Tree */}
      {selectedData && (
        <div className="apple-glass p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/18 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between pb-4 border-b border-white/12">
            <div>
              <span className="text-xs font-mono text-blue-300 font-bold uppercase tracking-wider">
                {selectedData.subject.code}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
                {selectedData.subject.title}
              </h2>
              <p className="text-xs text-slate-200 mt-1">
                {selectedData.subject.description}
              </p>
            </div>
            <div className="text-right">
              <span className="apple-glass-pill px-3 py-1 rounded-full text-xs font-mono text-slate-200 font-medium">
                {selectedData.modules.length} Modules • {selectedData.modules.reduce((a, m) => a + m.topics.length, 0)} Topics
              </span>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-4">
            {selectedData.modules.map((mod) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-white/14 apple-subcard overflow-hidden"
                >
                  {/* Module Accordion Header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-4.5 flex items-center justify-between text-left hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                        <p className="text-[11px] text-slate-300 mt-0.5">{mod.description}</p>
                      </div>
                    </div>
                    <span className="apple-glass-pill text-xs font-mono text-slate-200 px-2.5 py-1 rounded-full border border-white/14 font-medium">
                      {mod.topics.length} topics
                    </span>
                  </button>

                  {/* Topic Items Inside Module */}
                  {isExpanded && (
                    <div className="p-4.5 pt-0 border-t border-white/12 divide-y divide-white/10">
                      {mod.topics.map((t) => (
                        <div
                          key={t.id}
                          className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{t.title}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                                t.difficulty === 'hard'
                                  ? 'bg-rose-500/20 text-rose-200 border border-rose-400/35'
                                  : t.difficulty === 'medium'
                                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/35'
                                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/35'
                              }`}>
                                {t.difficulty}
                              </span>
                              {t.isCompleted && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-[#30d158]" />
                                  <span>Mastered</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-slate-300 font-mono">
                              <span className="flex items-center gap-1 text-blue-300">
                                <Clock className="w-3 h-3 text-blue-400" /> {t.durationMins}m
                              </span>
                              <span>Theory Obj: {t.theoryObjectives?.length || 0}</span>
                              <span>Practical Obj: {t.practicalObjectives?.length || 0}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                const match = COURSE_DOCUMENTS.find(
                                  (d) =>
                                    d.topicRef.toLowerCase().includes(t.title.toLowerCase()) ||
                                    t.title.toLowerCase().includes(d.topicRef.toLowerCase()) ||
                                    d.title.toLowerCase().includes(t.title.toLowerCase())
                                ) || COURSE_DOCUMENTS[0];
                                setSelectedReaderDoc(match);
                                setIsReaderOpen(true);
                              }}
                              className="apple-glass-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer border border-blue-400/20"
                              title="Open course slides / notes for this topic"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                              <span>Read Material</span>
                            </button>
                            <button
                              onClick={() => setEditingTopic(t)}
                              className="apple-glass-pill p-2 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                              title="Edit topic"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM SUBJECT */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="apple-glass-elevated p-5 sm:p-7 md:p-8 rounded-[26px] sm:rounded-[32px] border border-white/24 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/12">
              <h3 className="font-bold text-base text-white">Add New PGCP-BDA Subject</h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="apple-glass-pill p-1.5 rounded-xl text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5">Subject Title</label>
                <input
                  type="text"
                  required
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  placeholder="e.g. Linux & Shell Scripting"
                  className="apple-input w-full rounded-2xl p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1.5">Course Code</label>
                <input
                  type="text"
                  required
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="e.g. PGCP-BDA-05"
                  className="apple-input w-full rounded-2xl p-3 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="Linux OS internals, bash scripting, file permissions, pipes and redirection"
                  className="apple-input w-full rounded-2xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="apple-btn-secondary px-4 py-2.5 rounded-full text-slate-200 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2.5 rounded-full font-bold cursor-pointer shadow-md"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TOPIC */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="apple-glass-elevated p-5 sm:p-7 md:p-8 rounded-[26px] sm:rounded-[32px] border border-white/24 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/12">
              <h3 className="font-bold text-base text-white">Edit Topic</h3>
              <button onClick={() => setEditingTopic(null)} className="apple-glass-pill p-1.5 rounded-xl text-slate-300 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5">Topic Title</label>
                <input
                  type="text"
                  value={editingTopic.title}
                  onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                  className="apple-input w-full rounded-2xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5">Difficulty</label>
                  <select
                    value={editingTopic.difficulty}
                    onChange={(e) =>
                      setEditingTopic({
                        ...editingTopic,
                        difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                      })
                    }
                    className="apple-input w-full rounded-2xl p-3 text-white bg-[#0a0e1a]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editingTopic.durationMins}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, durationMins: Number(e.target.value) })
                    }
                    className="apple-input w-full rounded-2xl p-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="apple-btn-secondary px-4 py-2.5 rounded-full text-slate-200 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTopicEdit}
                  className="apple-btn-primary px-5 py-2.5 rounded-full font-bold cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* In-App Course Document Reader Modal */}
      <CourseDocumentReader
        document={selectedReaderDoc}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
}
