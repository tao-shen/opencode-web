import { NextRequest, NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'http://localhost:4096'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const response = await fetch(`${OPENCODE_SERVER}/sessions/${params.id}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Failed to send prompt: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending prompt:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
