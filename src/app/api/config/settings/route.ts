import { NextRequest, NextResponse } from 'next/server';

// Mock config settings endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    settings: {},
    source: 'web',
  });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({
    settings: {},
  });
}
