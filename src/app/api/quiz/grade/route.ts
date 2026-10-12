import { NextRequest, NextResponse } from 'next/server';
import { gradeQuiz } from '@/lib/assessment/scoring';
import { QuizQuestion } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId, userId, questions, responses, passThreshold, attemptNumber } = body;

    if (!quizId || !Array.isArray(questions) || !responses) {
      return NextResponse.json(
        { error: 'Invalid submission payload: quizId, questions, and responses required' },
        { status: 400 }
      );
    }

    const result = gradeQuiz({
      quizId,
      userId: userId || 'usr-student-01',
      questions: questions as QuizQuestion[],
      responses,
      passThreshold: passThreshold || 80,
      attemptNumber: attemptNumber || 1,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Quiz grading route error:', error);
    return NextResponse.json({ error: 'Failed to evaluate quiz' }, { status: 500 });
  }
}
