import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.OPENCODE_BACKEND_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/openchamber/models-metadata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      providers: [
        {
          id: 'openai',
          name: 'OpenAI',
          models: [
            { id: 'gpt-4', name: 'GPT-4' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
          ]
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          models: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
          ]
        }
      ]
    });
  }
}
