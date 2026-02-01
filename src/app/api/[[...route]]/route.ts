import { NextRequest, NextResponse } from 'next/server'
import { getSessionById, listProjectSessions, createNewSession } from '../../../lib/session'
import { createUserMessage, getSessionMessages, setSessionStatus } from '../../../lib/session'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OpenCode-Directory',
}

// Helper to create JSON response with CORS
function jsonResponse(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

// Health check - GET /api/global/health
export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // /api/global/health
  if (path.endsWith('/global/health')) {
    return jsonResponse({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
    })
  }
  
  // /api/config
  if (path.endsWith('/config')) {
    return jsonResponse({
      success: true,
      data: {
        providers: [
          { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
          { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250506', 'claude-opus-4-20250506'] },
        ],
        defaultAgent: 'general',
        defaultModel: { providerID: 'anthropic', modelID: 'claude-opus-4-20250506' },
      },
    })
  }
  
  // /api/tool
  if (path.endsWith('/tool')) {
    return jsonResponse({
      success: true,
      data: {
        tools: [
          { name: 'read', description: 'Read file contents', parameters: { type: 'object', properties: { path: { type: 'string' } } } },
          { name: 'write', description: 'Write file contents', parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } } },
          { name: 'edit', description: 'Edit file contents', parameters: { type: 'object', properties: { path: { type: 'string' }, oldString: { type: 'string' }, newString: { type: 'string' } } } },
          { name: 'bash', description: 'Execute shell command', parameters: { type: 'object', properties: { command: { type: 'string' } } } },
          { name: 'search', description: 'Search using ripgrep', parameters: { type: 'object', properties: { pattern: { type: 'string' }, path: { type: 'string' } } } },
          { name: 'lsp', description: 'Query language server', parameters: { type: 'object', properties: { query: { type: 'string' } } } },
          { name: 'format', description: 'Format code', parameters: { type: 'object', properties: { path: { type: 'string' } } } },
        ],
      },
    })
  }
  
  // /api/session - List sessions
  if (path.endsWith('/session') && request.method === 'GET') {
    try {
      const projectID = request.nextUrl.searchParams.get('projectID') || 'default'
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
      
      const sessions = await listProjectSessions(projectID, limit)
      
      return jsonResponse({
        success: true,
        data: {
          items: sessions,
          pagination: {
            hasMore: sessions.length >= limit,
          },
        },
      })
    } catch (error) {
      console.error('Error listing sessions:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sessions',
      }, 500)
    }
  }
  
  // /api/session/:id - Get session
  if (path.match(/\/api\/session\/[^/]+$/) && request.method === 'GET') {
    try {
      const sessionID = path.split('/').pop() || ''
      const session = await getSessionById(sessionID)
      
      if (!session) {
        return jsonResponse({
          success: false,
          error: 'Session not found',
        }, 404)
      }
      
      return jsonResponse({
        success: true,
        data: session,
      })
    } catch (error) {
      console.error('Error getting session:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      }, 500)
    }
  }
  
  // /api/session/:id/messages - Get messages
  if (path.match(/\/api\/session\/[^/]+\/messages$/) && request.method === 'GET') {
    try {
      const sessionID = path.split('/')[3]
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
      
      const messages = await getSessionMessages(sessionID, limit)
      
      return jsonResponse({
        success: true,
        data: {
          items: messages,
          pagination: {
            hasMore: messages.length >= limit,
          },
        },
      })
    } catch (error) {
      console.error('Error getting messages:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get messages',
      }, 500)
    }
  }
  
  // /api/session/:id/abort - Abort session
  if (path.match(/\/api\/session\/[^/]+\/abort$/) && request.method === 'POST') {
    try {
      const sessionID = path.split('/')[3]
      const session = await getSessionById(sessionID)
      
      if (!session) {
        return jsonResponse({
          success: false,
          error: 'Session not found',
        }, 404)
      }
      
      await setSessionStatus(sessionID, 'idle')
      
      return jsonResponse({
        success: true,
      })
    } catch (error) {
      console.error('Error aborting session:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to abort session',
      }, 500)
    }
  }
  
  return jsonResponse({ error: 'Not found' }, 404)
}

// Create session - POST /api/session
export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // /api/session - Create new session
  if (path.endsWith('/session')) {
    try {
      const body = await request.json()
      
      const session = await createNewSession({
        title: body.title,
        directory: body.directory,
        parentID: body.parentID,
        projectID: 'default',
        model: body.model,
        system: body.system,
        tools: body.tools,
      })
      
      return jsonResponse({
        success: true,
        data: session,
      })
    } catch (error) {
      console.error('Error creating session:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      }, 500)
    }
  }
  
  // /api/session/:id/prompt - Submit prompt
  if (path.match(/\/api\/session\/[^/]+\/prompt$/)) {
    try {
      const sessionID = path.split('/')[3]
      const body = await request.json()
      
      const session = await getSessionById(sessionID)
      if (!session) {
        return jsonResponse({
          success: false,
          error: 'Session not found',
        }, 404)
      }
      
      const message = await createUserMessage({
        sessionID,
        agent: body.agent || 'general',
        content: body.message,
        model: body.model || { providerID: 'anthropic', modelID: 'claude-opus-4-20250506' },
        system: body.system,
        tools: body.tools,
        variant: body.variant,
      })
      
      await setSessionStatus(sessionID, 'running')
      
      return jsonResponse({
        success: true,
        data: {
          messageID: message.id,
          status: 'started',
        },
      })
    } catch (error) {
      console.error('Error submitting prompt:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit prompt',
      }, 500)
    }
  }
  
  // /api/session/:id/fork - Fork session
  if (path.match(/\/api\/session\/[^/]+\/fork$/)) {
    try {
      const sessionID = path.split('/')[3]
      const body = await request.json()
      
      const session = await getSessionById(sessionID)
      if (!session) {
        return jsonResponse({
          success: false,
          error: 'Session not found',
        }, 404)
      }
      
      const newSession = await createNewSession({
        title: body.title || `Fork of ${session.title}`,
        parentID: sessionID,
        projectID: session.projectID,
      })
      
      return jsonResponse({
        success: true,
        data: newSession,
      })
    } catch (error) {
      console.error('Error forking session:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fork session',
      }, 500)
    }
  }
  
  return jsonResponse({ error: 'Not found' }, 404)
}

// Delete session - DELETE /api/session/:id
export async function DELETE(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.match(/\/api\/session\/[^/]+$/)) {
    try {
      const sessionID = path.split('/').pop() || ''
      const session = await getSessionById(sessionID)
      
      if (!session) {
        return jsonResponse({
          success: false,
          error: 'Session not found',
        }, 404)
      }
      
      return jsonResponse({
        success: true,
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      return jsonResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete session',
      }, 500)
    }
  }
  
  return jsonResponse({ error: 'Not found' }, 404)
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
