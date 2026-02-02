import { NextRequest, NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'http://localhost:4096'

export async function GET() {
  try {
    const response = await fetch(`${OPENCODE_SERVER}/session`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', response.status, errorText)
      throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    // The server returns sessions in a different format, normalize it
    const sessions = Array.isArray(data) ? data : (data.sessions || [])
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: String(error), sessions: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${OPENCODE_SERVER}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', response.status, errorText)
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
