import { NextRequest, NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const response = await fetch(`${OPENCODE_SERVER}/session/${id}/message`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', response.status, errorText)
      throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
