import { NextRequest, NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

// Use edge runtime for better timeout handling
export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Create an AbortController with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55s timeout (Vercel edge limit is 60s)

    try {
      const response = await fetch(`${OPENCODE_SERVER}/session/${id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Failed to send prompt: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      // If it's an abort error, the message was likely sent successfully
      // The client will get updates via SSE
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          status: 'processing',
          message: 'Request is being processed. Check SSE for updates.'
        })
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error sending prompt:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
