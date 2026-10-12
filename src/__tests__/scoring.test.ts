import { describe, it, expect } from 'vitest';
import {
  gradeQuiz,
  verifyStudyDayGate,
  calculateTopicMastery,
} from '../lib/assessment/scoring';
import { QuizQuestion, StudyDay } from '../types';

describe('Assessment & Scoring Logic', () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quizId: 'quiz-test',
      questionText: 'What is PRIMARY KEY constraint?',
      questionType: 'single_mcq',
      correctAnswer: 'opt1',
      explanation: 'Primary key uniquely identifies rows.',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'q2',
      quizId: 'quiz-test',
      questionText: 'Select all valid SQL joins:',
      questionType: 'multi_mcq',
      correctAnswer: ['optA', 'optB'],
      explanation: 'INNER and LEFT are valid joins.',
      difficulty: 'medium',
      marks: 1,
    },
  ];

  it('correctly grades single and multi-select MCQs with 100% pass', () => {
    const result = gradeQuiz({
      quizId: 'quiz-test',
      userId: 'usr-1',
      questions: mockQuestions,
      responses: {
        q1: 'opt1',
        q2: ['optA', 'optB'],
      },
      passThreshold: 80,
    });

    expect(result.attempt.score).toBe(2);
    expect(result.attempt.percentage).toBe(100);
    expect(result.attempt.passed).toBe(true);
    expect(result.weakQuestionIds.length).toBe(0);
  });

  it('fails an attempt when score is below 80% and isolates weak questions', () => {
    const result = gradeQuiz({
      quizId: 'quiz-test',
      userId: 'usr-1',
      questions: mockQuestions,
      responses: {
        q1: 'opt1',
        q2: ['wrongOption'],
      },
      passThreshold: 80,
    });

    expect(result.attempt.score).toBe(1);
    expect(result.attempt.percentage).toBe(50);
    expect(result.attempt.passed).toBe(false);
    expect(result.weakQuestionIds).toContain('q2');
  });
});

describe('Mandatory Daily Completion Gate', () => {
  const baseDay: StudyDay = {
    id: 'day-03',
    planId: 'plan-1',
    userId: 'usr-1',
    dayNumber: 3,
    scheduledDate: '2026-10-09',
    subjectId: 'sub-mysql',
    status: 'in_progress',
    theoryStatus: 'pending',
    practicalStatus: 'pending',
  };

  it('locks quiz when theory or practical is incomplete', () => {
    const gate1 = verifyStudyDayGate(baseDay);
    expect(gate1.canUnlockQuiz).toBe(false);
    expect(gate1.canMarkComplete).toBe(false);

    // Theory complete but practical pending
    const gate2 = verifyStudyDayGate({
      ...baseDay,
      theoryStatus: 'completed',
      practicalStatus: 'pending',
    });
    expect(gate2.canUnlockQuiz).toBe(false);
    expect(gate2.canMarkComplete).toBe(false);
  });

  it('unlocks quiz only when BOTH theory and practical are completed', () => {
    const gate = verifyStudyDayGate({
      ...baseDay,
      theoryStatus: 'completed',
      practicalStatus: 'completed',
    });
    expect(gate.canUnlockQuiz).toBe(true);
    expect(gate.canMarkComplete).toBe(false);
  });

  it('marks study day complete ONLY when quiz score >= pass threshold', () => {
    const dayWithPrereqs: StudyDay = {
      ...baseDay,
      theoryStatus: 'completed',
      practicalStatus: 'completed',
    };

    // Quiz failed (70%)
    const failedAttempt = {
      id: 'att-1',
      quizId: 'q-1',
      userId: 'usr-1',
      score: 7,
      maxScore: 10,
      percentage: 70,
      passed: false,
      attemptNumber: 1,
      startedAt: new Date().toISOString(),
    };
    const gateFailed = verifyStudyDayGate(dayWithPrereqs, failedAttempt, 80);
    expect(gateFailed.canMarkComplete).toBe(false);
    expect(gateFailed.nextStatus).toBe('needs_revision');

    // Quiz passed (90%)
    const passedAttempt = {
      ...failedAttempt,
      score: 9,
      percentage: 90,
      passed: true,
    };
    const gatePassed = verifyStudyDayGate(dayWithPrereqs, passedAttempt, 80);
    expect(gatePassed.canMarkComplete).toBe(true);
    expect(gatePassed.nextStatus).toBe('completed');
  });
});

describe('Topic Mastery Progression', () => {
  it('correctly maps study stages to mastery statuses', () => {
    expect(calculateTopicMastery(false, false, false, 0).status).toBe('not_started');
    expect(calculateTopicMastery(true, false, false, 0).status).toBe('covered');
    expect(calculateTopicMastery(true, true, false, 50).status).toBe('practiced');
    expect(calculateTopicMastery(true, true, true, 85).status).toBe('mastered');
  });
});
