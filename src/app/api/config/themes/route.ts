import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.OPENCODE_BACKEND_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/config/themes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      themes: ['dark', 'light', 'system'],
      default: 'dark',
    });
  }
}
