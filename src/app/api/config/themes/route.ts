import { NextRequest, NextResponse } from 'next/server';

// Mock config themes endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    themes: ['dark', 'light', 'system'],
    default: 'dark',
  });
}
