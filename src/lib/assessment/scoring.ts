import {
  QuizQuestion,
  QuizAttempt,
  QuizResponse,
  StudyDay,
  StudyDayStatus,
  MasteryStatus,
} from '@/types';

export interface GradeQuizInput {
  quizId: string;
  userId: string;
  questions: QuizQuestion[];
  responses: Record<string, string | string[] | boolean>;
  passThreshold?: number; // default 80
  attemptNumber?: number;
}

export interface GradeQuizResult {
  attempt: QuizAttempt;
  responses: QuizResponse[];
  weakQuestionIds: string[];
  remediationAdvice: string;
}

/**
 * Deterministic Grading Engine for Objective Questions
 * Evaluates single MCQ, multi-select, and true/false questions on server-side.
 */
export function gradeQuiz(input: GradeQuizInput): GradeQuizResult {
  const { quizId, userId, questions, responses, passThreshold = 80, attemptNumber = 1 } = input;

  let totalScore = 0;
  let maxScore = 0;
  const gradedResponses: QuizResponse[] = [];
  const weakQuestionIds: string[] = [];

  for (const q of questions) {
    maxScore += q.marks;
    const studentAns = responses[q.id];
    let isCorrect = false;

    if (q.questionType === 'single_mcq' || q.questionType === 'true_false') {
      isCorrect = String(studentAns).trim() === String(q.correctAnswer).trim();
    } else if (q.questionType === 'multi_mcq') {
      const correctArr = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((a) => String(a).trim()).sort()
        : [String(q.correctAnswer).trim()];
      const studentArr = Array.isArray(studentAns)
        ? studentAns.map((a) => String(a).trim()).sort()
        : [String(studentAns).trim()];

      isCorrect =
        correctArr.length === studentArr.length &&
        correctArr.every((val, index) => val === studentArr[index]);
    } else {
      // Direct string comparison for exact output predictions or normalize whitespace
      isCorrect =
        String(studentAns || '').trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) {
      totalScore += q.marks;
    } else {
      weakQuestionIds.push(q.id);
    }

    gradedResponses.push({
      id: `resp-${Date.now()}-${q.id}`,
      attemptId: '', // populated below
      questionId: q.id,
      studentAnswer: studentAns !== undefined ? studentAns : '',
      isCorrect,
      aiFeedback: isCorrect
        ? 'Correct! Concept verified.'
        : `Incorrect. Review: ${q.explanation}`,
    });
  }

  const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;
  const passed = percentage >= passThreshold;

  const attemptId = `att-${Date.now()}`;
  for (const r of gradedResponses) {
    r.attemptId = attemptId;
  }

  const remediationAdvice = passed
    ? percentage === 100
      ? 'Outstanding! 100% mastery achieved. Ready for the next scheduled study topic.'
      : 'Passed! Minor gaps identified. Weak concepts have been logged for spaced repetition.'
    : `Score of ${percentage}% is below the required ${passThreshold}% pass threshold. Review the explanations above, address identified weak areas, and take the generated retry quiz.`;

  const attempt: QuizAttempt = {
    id: attemptId,
    quizId,
    userId,
    score: totalScore,
    maxScore,
    percentage,
    passed,
    attemptNumber,
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date().toISOString(),
    responses: gradedResponses,
  };

  return {
    attempt,
    responses: gradedResponses,
    weakQuestionIds,
    remediationAdvice,
  };
}

/**
 * Mandatory Daily Completion Gate Verifier
 * Enforces: Theory completed -> Practical completed -> Quiz passed (>= 80%) -> Day completed
 */
export interface DayGateVerification {
  canUnlockQuiz: boolean;
  canMarkComplete: boolean;
  nextStatus: StudyDayStatus;
  reasons: string[];
}

export function verifyStudyDayGate(day: StudyDay, latestQuizAttempt?: QuizAttempt, passThreshold = 80): DayGateVerification {
  const reasons: string[] = [];

  const theoryDone = day.theoryStatus === 'completed';
  const practicalDone = day.practicalStatus === 'completed';

  if (!theoryDone) {
    reasons.push('Theory task must be thoroughly reviewed and self-check recorded.');
  }

  if (!practicalDone) {
    reasons.push('Practical exercise must be coded and submitted with execution evidence.');
  }

  const canUnlockQuiz = theoryDone && practicalDone;

  let canMarkComplete = false;
  let nextStatus: StudyDayStatus = day.status;

  if (!canUnlockQuiz) {
    if (theoryDone) {
      nextStatus = 'theory_completed';
    } else if (day.status === 'not_started') {
      nextStatus = 'in_progress';
    }
  } else {
    // Both theory and practical are done
    if (!latestQuizAttempt) {
      nextStatus = 'quiz_unlocked';
      reasons.push('Daily AI Quiz is unlocked! You must achieve >= 80% to complete today.');
    } else if (latestQuizAttempt.passed) {
      canMarkComplete = true;
      nextStatus = 'completed';
    } else {
      nextStatus = 'needs_revision';
      reasons.push(`Quiz score ${latestQuizAttempt.percentage}% is below required ${passThreshold}%. Retake required.`);
    }
  }

  return {
    canUnlockQuiz,
    canMarkComplete,
    nextStatus,
    reasons,
  };
}

/**
 * Calculate Topic Mastery based on assessment history
 */
export function calculateTopicMastery(
  theoryDone: boolean,
  practicalSubmitted: boolean,
  quizPassed: boolean,
  quizScore: number
): { status: MasteryStatus; overallScore: number } {
  if (!theoryDone && !practicalSubmitted) {
    return { status: 'not_started', overallScore: 0 };
  }

  if (theoryDone && !practicalSubmitted) {
    return { status: 'covered', overallScore: 40 };
  }

  if (theoryDone && practicalSubmitted && !quizPassed) {
    return { status: 'practiced', overallScore: 60 };
  }

  if (quizPassed && quizScore >= 80) {
    return { status: 'mastered', overallScore: quizScore };
  }

  return { status: 'assessed', overallScore: quizScore };
}
