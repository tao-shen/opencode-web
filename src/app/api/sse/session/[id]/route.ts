import { NextRequest, NextResponse } from 'next/server'
import { getSessionById, getSessionMessages } from '../../../../../lib/session'
import { subscribeToChannel } from '../../../../../lib/storage'
import { v4 as uuidv4 } from 'uuid'

// Helper to parse SSE data
function parseSSEMessage(event: string, data: unknown): string {
  const lines = [`event: ${event}`]
  lines.push(`data: ${JSON.stringify(data)}`)
  lines.push('')
  lines.push('')
  return lines.join('\n')
}

// GET /api/sse/session/:id - Server-Sent Events for session updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionID } = await params
  
  // Verify session exists
  const session = await getSessionById(sessionID)
  if (!session) {
    return new NextResponse('Session not found', { status: 404 })
  }
  
  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(new TextEncoder().encode(
        parseSSEMessage('connected', { sessionID, timestamp: Date.now() })
      ))
      
      // Get existing messages
      getSessionMessages(sessionID).then((messages) => {
        for (const message of messages) {
          controller.enqueue(new TextEncoder().encode(
            parseSSEMessage('message.created', { message })
          ))
        }
      }).catch(console.error)
      
      // Subscribe to Redis channel for real-time updates
      const channel = `session:${sessionID}`
      const eventGenerator = subscribeToChannel(channel)
      
      // Set up interval heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)
      
      // Process events (this is a simplified version - in production use proper async iteration)
      const processEvents = async () => {
        try {
          const iterator = eventGenerator[Symbol.asyncIterator]()
          
          while (true) {
            const result = await iterator.next()
            if (result.done) break
            
            controller.enqueue(new TextEncoder().encode(
              parseSSEMessage(result.value.event, result.value.data)
            ))
          }
        } catch (error) {
          console.error('SSE stream error:', error)
        }
      }
      
      processEvents().catch(console.error)
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
