import { NextRequest, NextResponse } from 'next/server';
import { generateDailyQuiz } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicTitle, subjectTitle, learningObjectives, weakAreas } = body;

    if (!topicTitle || !subjectTitle) {
      return NextResponse.json({ error: 'Missing topic or subject title' }, { status: 400 });
    }

    const questions = await generateDailyQuiz(
      topicTitle,
      subjectTitle,
      learningObjectives || [],
      weakAreas || []
    );

    return NextResponse.json({
      success: true,
      quiz: {
        id: `quiz-${Date.now()}`,
        topicTitle,
        subjectTitle,
        passThreshold: 80,
        version: 1,
        questions,
      },
    });
  } catch (error) {
    console.error('Quiz generation route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please retry.' },
      { status: 500 }
    );
  }
}
