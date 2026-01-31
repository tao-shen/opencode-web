import { v4 as uuidv4 } from 'uuid'
import type {
  Session,
  UserMessage,
  AssistantMessage,
  PermissionRequest,
  SessionStatus,
} from '../types'
import {
  createSession as storageCreateSession,
  getSession,
  listSessions,
  createMessage,
  getMessage,
  listMessages,
  updateSessionStatus,
  type SessionStorage,
  type MessageStorage,
} from './storage'
import { publishEvent } from './storage'

// Default AI providers and models
const DEFAULT_PROVIDER = 'openai'
const DEFAULT_MODEL = 'gpt-4o'

// Generate unique slug for session URL
function generateSlug(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `sess-${timestamp}-${random}`
}

// Create a new session
export async function createNewSession(options: {
  title?: string
  directory?: string
  parentID?: string
  projectID: string
  model?: { providerID: string; modelID: string }
  system?: string
  tools?: { enable?: string[]; disable?: string[] }
}): Promise<Session> {
  const sessionID = uuidv4()
  const slug = generateSlug()
  const now = Date.now()
  
  const session: SessionStorage = {
    id: sessionID,
    slug,
    title: options.title || 'New Session',
    projectID: options.projectID,
    directory: options.directory || process.cwd(),
    parentID: options.parentID,
    version: '1.0.0',
    time: {
      created: now,
      updated: now,
    },
    status: 'idle',
  }
  
  await storageCreateSession(session)
  
  // Publish session created event
  await publishEvent(`session:${sessionID}`, 'session.created', { info: session })
  
  return {
    ...session,
    permission: undefined,
    summary: undefined,
    status: session.status as SessionStatus,
  }
}

// Get session by ID or slug
export async function getSessionById(sessionID: string): Promise<Session | null> {
  const session = await getSession(sessionID)
  
  if (!session) {
    return null
  }
  
  return {
    ...session,
    permission: session.permission as Session['permission'],
    status: session.status as SessionStatus,
  }
}

// List sessions for a project
export async function listProjectSessions(projectID: string, limit = 20): Promise<Session[]> {
  const sessions = await listSessions(projectID, limit)
  
  return sessions.map((session) => ({
    ...session,
    permission: session.permission as Session['permission'],
    status: session.status as SessionStatus,
  }))
}

// Create a user message
export async function createUserMessage(options: {
  sessionID: string
  agent: string
  content: string
  model: { providerID: string; modelID: string }
  system?: string
  tools?: { enable?: string[]; disable?: string[] }
  variant?: string
}): Promise<UserMessage> {
  const messageID = uuidv4()
  const now = Date.now()
  
  const message: MessageStorage = {
    id: messageID,
    sessionID: options.sessionID,
    role: 'user',
    agent: options.agent,
    modelID: options.model.modelID,
    providerID: options.model.providerID,
    content: options.content,
    cost: 0,
    tokens: JSON.stringify({ input: 0, output: 0, reasoning: 0, cache: 0 }),
    time: now,
  }
  
  await createMessage(message)
  
  return {
    id: messageID,
    sessionID: options.sessionID,
    role: 'user',
    agent: options.agent,
    model: options.model,
    system: options.system,
    tools: options.tools,
    variant: options.variant,
    time: now,
  }
}

// Create an assistant message with initial data
export async function createAssistantMessage(options: {
  sessionID: string
  parentID: string
  agent: string
  modelID: string
  providerID: string
}): Promise<AssistantMessage> {
  const messageID = uuidv4()
  const now = Date.now()
  
  const message: MessageStorage = {
    id: messageID,
    sessionID: options.sessionID,
    role: 'assistant',
    agent: options.agent,
    modelID: options.modelID,
    providerID: options.providerID,
    parentID: options.parentID,
    content: '',
    cost: 0,
    tokens: JSON.stringify({ input: 0, output: 0, reasoning: 0, cache: 0 }),
    time: now,
  }
  
  await createMessage(message)
  
  return {
    id: messageID,
    sessionID: options.sessionID,
    parentID: options.parentID,
    role: 'assistant',
    agent: options.agent,
    modelID: options.modelID,
    providerID: options.providerID,
    cost: 0,
    tokens: {
      input: 0,
      output: 0,
      reasoning: 0,
      cache: 0,
    },
    time: now,
  }
}

// Get messages for a session
export async function getSessionMessages(sessionID: string, limit = 50): Promise<Array<UserMessage | AssistantMessage>> {
  const messages = await listMessages(sessionID, limit)
  
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return {
        id: msg.id,
        sessionID: msg.sessionID,
        role: 'user' as const,
        agent: msg.agent,
        model: {
          providerID: msg.providerID,
          modelID: msg.modelID,
        },
        time: msg.time,
      }
    }
    
    return {
      id: msg.id,
      sessionID: msg.sessionID,
      parentID: msg.parentID!,
      role: 'assistant' as const,
      agent: msg.agent,
      modelID: msg.modelID,
      providerID: msg.providerID,
      cost: msg.cost,
      tokens: JSON.parse(msg.tokens),
      error: msg.error,
      summary: msg.summary,
      time: msg.time,
    }
  })
}

// Update message content (for streaming responses)
export async function updateMessageContent(messageID: string, content: string): Promise<void> {
  const message = await getMessage(messageID)
  if (message) {
    const redis = await import('./storage')
    const storage = await import('./storage')
  }
}

// Publish tool execution event
export async function publishToolEvent(
  sessionID: string,
  type: 'tool.started' | 'tool.completed' | 'tool.error',
  data: {
    messageID: string
    tool: string
    id: string
    input: Record<string, unknown>
    output?: unknown
    error?: string
  }
): Promise<void> {
  await publishEvent(`session:${sessionID}`, type, data)
}

// Publish permission request
export async function requestPermission(
  sessionID: string,
  request: Omit<PermissionRequest, 'id' | 'sessionID' | 'time'>
): Promise<PermissionRequest> {
  const permissionRequest: PermissionRequest = {
    id: uuidv4(),
    sessionID,
    ...request,
    time: Date.now(),
  }
  
  await publishEvent(`session:${sessionID}`, 'permission.asked', permissionRequest)
  
  return permissionRequest
}

// Update session status
export async function setSessionStatus(sessionID: string, status: Session['status']): Promise<void> {
  await updateSessionStatus(sessionID, status)
  await publishEvent(`session:${sessionID}`, 'session.status', { status })
}

// Simulated AI response (in production, this would call actual AI APIs)
export async function generateAIResponse(options: {
  sessionID: string
  messageID: string
  prompt: string
  model: { providerID: string; modelID: string }
}): Promise<string> {
  // Simulate AI response
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  const response = `I understand you're asking about: "${options.prompt}"

Based on your request, here's what I can help you with:

1. Analyzing your input
2. Processing the context
3. Generating a relevant response

This is a simulated AI response. In production, this would call the actual AI API (${options.model.providerID}/${options.model.modelID}).`
  
  return response
}
