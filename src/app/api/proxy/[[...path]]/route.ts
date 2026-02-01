import { NextRequest, NextResponse } from 'next/server'

const SERVER_URL = process.env.OPENCODE_SERVER_URL || 'https://opencode.tao-shen.com'

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
    const response = await fetch(`${SERVER_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
