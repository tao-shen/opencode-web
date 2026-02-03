import { NextRequest, NextResponse } from 'next/server';

// Mock auth session endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}
