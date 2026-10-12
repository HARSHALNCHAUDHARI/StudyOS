import { NextRequest, NextResponse } from 'next/server';
import { getStudyCoachAdvice, getAIServiceStatus } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { completedTopics, totalTopics, weakTopics, streak, daysRemaining, latestScore, userQuery, query, message } = body;

    const actualQuery = (userQuery || query || message || '').trim();

    const advice = await getStudyCoachAdvice(
      {
        completedTopics: Number(completedTopics ?? 0),
        totalTopics: Number(totalTopics || 53),
        weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
        streak: Number(streak ?? 0),
        daysRemaining: Number(daysRemaining || 150),
        latestScore: latestScore !== undefined ? Number(latestScore) : undefined,
      },
      actualQuery
    );

    const status = getAIServiceStatus();

    return NextResponse.json({
      success: true,
      advice,
      status,
    });
  } catch (error) {
    console.error('Coach advice error:', error);
    return NextResponse.json({ error: 'Failed to retrieve coach advice' }, { status: 500 });
  }
}
