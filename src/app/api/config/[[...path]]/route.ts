import { NextRequest, NextResponse } from 'next/server';

// Catch-all config endpoint for any other config calls
export async function GET(request: NextRequest) {
  return NextResponse.json({});
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({});
}

export async function POST(request: NextRequest) {
  return NextResponse.json({});
}
