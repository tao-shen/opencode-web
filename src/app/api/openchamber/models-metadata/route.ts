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
    // Return mock data with free/cheap models
    return NextResponse.json({
      providers: [
        {
          id: 'opencode',
          name: 'OpenCode',
          models: [
            { id: 'big-pickle', name: 'Big Pickle', isFree: true, price_per_million_tokens: 0 },
            { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', price_per_million_tokens: 3000 },
            { id: 'gpt-4o', name: 'GPT-4o', price_per_million_tokens: 5000 }
          ]
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          models: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', isFree: false, price_per_million_tokens: 3000 },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', isFree: true, price_per_million_tokens: 250 }
          ]
        },
        {
          id: 'openai',
          name: 'OpenAI',
          models: [
            { id: 'gpt-4o', name: 'GPT-4o', isFree: false, price_per_million_tokens: 5000 },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', isFree: true, price_per_million_tokens: 150 },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', isFree: true, price_per_million_tokens: 50 }
          ]
        },
        {
          id: 'google',
          name: 'Google',
          models: [
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', isFree: true, price_per_million_tokens: 0 },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', isFree: true, price_per_million_tokens: 75 },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', isFree: false, price_per_million_tokens: 1250 }
          ]
        },
        {
          id: 'deepseek',
          name: 'DeepSeek',
          models: [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', isFree: true, price_per_million_tokens: 14 },
            { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', isFree: true, price_per_million_tokens: 14 }
          ]
        }
      ]
    });
  }
}
