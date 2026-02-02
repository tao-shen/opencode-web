import { NextRequest, NextResponse } from 'next/server'

const SERVER_URL = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  
  try {
    const response = await fetch(`${SERVER_URL}${path}${path.includes('?') ? '&' : '?'}${request.nextUrl.searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ healthy: false, error: 'Server unreachable' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  
  try {
    const body = await request.json()
    console.log('[Proxy POST]', { path, SERVER_URL, body })
    
    const response = await fetch(`${SERVER_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('[Proxy POST Response]', { status: response.status, ok: response.ok })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Proxy POST Error]', { status: response.status, errorText })
      return NextResponse.json(
        { error: `Server responded with ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[Proxy POST Exception]', error)
    return NextResponse.json(
      { error: 'Proxy error', message: String(error) },
      { status: 500 }
    )
  }
}
