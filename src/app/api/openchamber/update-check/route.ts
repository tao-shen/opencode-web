import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    updateAvailable: false,
    currentVersion: '0.0.3-web',
    latestVersion: null,
    downloadUrl: null,
  });
}
