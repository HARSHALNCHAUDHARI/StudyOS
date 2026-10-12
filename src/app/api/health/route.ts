import { NextResponse } from 'next/server';
import { getAIServiceStatus } from '@/lib/ai';

export async function GET() {
  const aiStatus = getAIServiceStatus();
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    ai: aiStatus,
    version: '1.0.0',
    platform: 'StudyOS AI - C-DAC PGCP-BDA Edition',
  });
}
