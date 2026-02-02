import { NextRequest, NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Fire and forget - don't wait for response
    // The client will get updates via SSE
    fetch(`${OPENCODE_SERVER}/session/${id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).catch(err => {
      console.error('Background message send error:', err)
    })

    // Return immediately
    return NextResponse.json({
      status: 'sent',
      message: 'Message sent. Response will stream via SSE.'
    })
  } catch (error) {
    console.error('Error sending prompt:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
