// StudyOS AI TypeScript Type Definitions

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type StudyDayStatus =
  | 'not_started'
  | 'in_progress'
  | 'theory_completed'
  | 'practical_completed'
  | 'quiz_unlocked'
  | 'quiz_attempted'
  | 'quiz_passed'
  | 'completed'
  | 'needs_revision';

export type TaskType = 'theory' | 'practical' | 'revision';

export type QuestionType =
  | 'single_mcq'
  | 'multi_mcq'
  | 'true_false'
  | 'output_prediction'
  | 'bug_finding'
  | 'sql_query'
  | 'short_answer';

export type ResourceType = 'pdf' | 'docx' | 'pptx' | 'sql' | 'csv' | 'url' | 'notes';

export type MasteryStatus = 'not_started' | 'covered' | 'practiced' | 'assessed' | 'mastered';

export interface PreloadedSubjectData {
  subject: Subject;
  modules: (Module & { topics: Topic[] })[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  targetExamDate: string;
  dailyTimeBudget: number; // in minutes (default 120)
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  avatarUrl?: string;
}

export interface UserSettings {
  userId: string;
  darkMode: boolean;
  notificationInApp: boolean;
  notificationBrowser: boolean;
  passThreshold: number; // default 80%
  quietHoursStart: string;
  quietHoursEnd: string;
  userTimezone: string;
  subjectRotationStrategy: 'balanced_daily' | 'block_mastery' | 'exam_priority';
}

export interface Subject {
  id: string;
  userId?: string;
  title: string;
  code: string;
  description: string;
  icon: string;
  isCustom: boolean;
  modulesCount?: number;
  topicsCount?: number;
  completedTopicsCount?: number;
  overallMastery?: number;
}

export interface Module {
  id: string;
  subjectId: string;
  title: string;
  sequenceOrder: number;
  description?: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  moduleId: string;
  subjectId: string;
  title: string;
  difficulty: DifficultyLevel;
  durationMins: number;
  theoryObjectives: string[];
  practicalObjectives: string[];
  prerequisites: string[];
  subtopics?: Subtopic[];
  resources?: Resource[];
  masteryStatus?: MasteryStatus;
  theoryScore?: number;
  practicalScore?: number;
  quizScore?: number;
  isCompleted?: boolean;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  sequenceOrder: number;
}

export interface Resource {
  id: string;
  topicId?: string;
  userId: string;
  title: string;
  resourceType: ResourceType;
  filePath?: string;
  fileSize?: number;
  extractedText?: string;
  isStudied: boolean;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  targetEndDate: string;
  dailyAllocationRules: {
    theory: number;    // e.g. 50 mins
    practical: number; // e.g. 60 mins
    revision: number;  // e.g. 10 mins
  };
  isActive: boolean;
}

export interface StudyDay {
  id: string;
  planId: string;
  userId: string;
  dayNumber: number;
  scheduledDate: string;
  subjectId: string;
  subjectTitle?: string;
  topicTitle?: string;
  status: StudyDayStatus;
  theoryStatus: 'pending' | 'in_progress' | 'completed';
  practicalStatus: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  tasks?: DailyTask[];
  quiz?: Quiz;
}

export interface DailyTask {
  id: string;
  studyDayId: string;
  topicId: string;
  taskType: TaskType;
  timeAllocatedMins: number;
  content: {
    title: string;
    summary?: string;
    learningObjectives?: string[];
    notes?: string;
    definitions?: { term: string; explanation: string }[];
    examples?: string[];
    syntaxSnippet?: string;
    problemStatement?: string;
    requirements?: string[];
    starterCode?: string;
    expectedOutput?: string;
    testCases?: { input: string; expected: string }[];
    hints?: string[];
    solutionSnippet?: string;
    solutionExplanation?: string;
    recallPrompts?: string[];
  };
  completed: boolean;
}

export interface PracticalSubmission {
  id: string;
  dailyTaskId: string;
  userId: string;
  codeQuery: string;
  executionResult?: string;
  status: 'submitted' | 'verified' | 'failed';
  verificationMode: 'self_evidence' | 'sandbox_run' | 'admin_override';
  submittedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  topicId?: string;
  questionText: string;
  questionType: QuestionType;
  options?: { id: string; text: string }[];
  correctAnswer: string | string[] | boolean;
  explanation: string;
  difficulty: DifficultyLevel;
  marks: number;
}

export interface Quiz {
  id: string;
  studyDayId?: string;
  subjectId: string;
  topicId?: string;
  title: string;
  passThreshold: number; // default 80
  version: number;
  questions: QuizQuestion[];
  latestAttempt?: QuizAttempt;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  responses?: QuizResponse[];
}

export interface QuizResponse {
  id: string;
  attemptId: string;
  questionId: string;
  studentAnswer: string | string[] | boolean;
  isCorrect: boolean;
  aiFeedback?: string;
}

export interface FinalExam {
  id: string;
  subjectId: string;
  subjectTitle?: string;
  title: string;
  totalMarks: number; // 100
  theoryMarks: number; // 40
  practicalMarks: number; // 60
  passThreshold: number; // 60%
  durationMins: number; // 120 mins
  isActive: boolean;
  questions?: FinalExamQuestion[];
}

export interface FinalExamQuestion {
  id: string;
  examId: string;
  topicId?: string;
  topicTitle?: string;
  section: 'theory' | 'practical';
  questionType: QuestionType;
  marks: number;
  questionText: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string | string[] | boolean;
  expectedKeywords?: string[];
  rubric?: string;
  solution?: string;
}

export interface FinalExamAttempt {
  id: string;
  examId: string;
  userId: string;
  theoryScore: number;
  practicalScore: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  isMockMode: boolean;
  startedAt: string;
  submittedAt?: string;
  remediationPlan?: {
    weakTopics: string[];
    recommendedActions: string[];
    summary: string;
  };
}

export interface RevisionItem {
  id: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  subjectId: string;
  subjectTitle: string;
  stage: number; // 1 (1d), 2 (3d), 3 (7d), 4 (14d)
  intervalDays: number;
  nextRevisionDate: string;
  isCompleted: boolean;
  lastScore?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'daily_study' | 'quiz_due' | 'revision_due' | 'streak_alert' | 'exam_readiness' | 'general';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
