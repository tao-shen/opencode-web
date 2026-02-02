import { NextRequest } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')

  try {
    // Subscribe to server events
    const response = await fetch(`${OPENCODE_SERVER}/event`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

    if (!response.ok) {
      return new Response(`Failed to connect to event stream: ${response.status}`, { status: 500 })
    }

    // Create a TransformStream to filter events by session
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const text = decoder.decode(value, { stream: true })

            // Forward all events, filtering by session if specified
            if (sessionId) {
              // Parse SSE format and filter
              const lines = text.split('\n')
              let filteredOutput = ''

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  try {
                    const data = JSON.parse(line.slice(5))
                    if (data.sessionId === sessionId || !data.sessionId) {
                      filteredOutput += line + '\n'
                    }
                  } catch {
                    // Not JSON, forward as-is
                    filteredOutput += line + '\n'
                  }
                } else {
                  filteredOutput += line + '\n'
                }
              }

              if (filteredOutput) {
                controller.enqueue(encoder.encode(filteredOutput))
              }
            } else {
              controller.enqueue(value)
            }
          }
        } catch (error) {
          console.error('SSE stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error connecting to event stream:', error)
    return new Response(`Error: ${String(error)}`, { status: 500 })
  }
}
