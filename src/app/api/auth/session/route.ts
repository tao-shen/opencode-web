import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 'web-user',
      username: 'Web User'
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 'web-user',
      username: 'Web User'
    },
  });
}
