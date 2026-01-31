// Type definitions for OpenCode Web API

export interface Session {
  id: string
  slug: string
  title: string
  projectID: string
  directory: string
  parentID?: string
  version: string
  time: {
    created: number
    updated: number
  }
  permission?: PermissionRuleset
  summary?: {
    additions: number
    deletions: number
    files: number
  }
  status: SessionStatus
}

export type SessionStatus = 'idle' | 'running' | 'completed' | 'error'

export interface UserMessage {
  id: string
  sessionID: string
  role: 'user'
  agent: string
  model: {
    providerID: string
    modelID: string
  }
  system?: string
  tools?: {
    enable?: string[]
    disable?: string[]
  }
  variant?: string
  time: number
}

export interface AssistantMessage {
  id: string
  sessionID: string
  parentID: string
  role: 'assistant'
  agent: string
  modelID: string
  providerID: string
  cost: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cache: number
  }
  finish?: string
  error?: string
  summary?: boolean
  time: number
}

export type MessagePart =
  | TextPart
  | ReasoningPart
  | FilePart
  | ToolPart
  | AgentPart
  | StepStartPart
  | StepFinishPart

export interface TextPart {
  type: 'text'
  content: string
}

export interface ReasoningPart {
  type: 'reasoning'
  content: string
  signature?: string
}

export interface FilePart {
  type: 'file'
  path: string
  content?: string
  language?: string
}

export interface ToolPart {
  type: 'tool'
  tool: string
  id: string
  input: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: unknown
  time?: {
    started?: number
    completed?: number
  }
}

export interface AgentPart {
  type: 'agent'
  agent: string
  reason: string
}

export interface StepStartPart {
  type: 'stepStart'
  level: number
  title: string
}

export interface StepFinishPart {
  type: 'stepFinish'
  metrics?: {
    duration: number
    tokens: number
  }
}

export interface PermissionRuleset {
  default: PermissionLevel
  agents?: Record<string, PermissionLevel>
  tools?: Record<string, PermissionLevel>
}

export type PermissionLevel = 'allow' | 'deny' | 'ask'

export interface PermissionRequest {
  id: string
  sessionID: string
  type: 'tool' | 'agent' | 'model'
  target: string
  description: string
  context?: Record<string, unknown>
  time: number
}

export interface CreateSessionRequest {
  title?: string
  directory?: string
  parentID?: string
  model?: {
    providerID: string
    modelID: string
  }
  system?: string
  tools?: {
    enable?: string[]
    disable?: string[]
  }
}

export interface PromptRequest {
  message: string
  agent?: string
  model?: {
    providerID: string
    modelID: string
  }
  variant?: string
  system?: string
  tools?: {
    enable?: string[]
    disable?: string[]
  }
}

export interface CommandRequest {
  command: string
  timeout?: number
}

export interface SessionResponse {
  success: boolean
  data?: Session
  error?: string
}

export interface PromptResponse {
  success: boolean
  data?: {
    messageID: string
    status: 'started' | 'completed' | 'error'
    result?: AssistantMessage
  }
  error?: string
}

export interface EventPayload {
  type: string
  properties: Record<string, unknown>
}

export interface PaginationParams {
  limit?: number
  before?: string
  after?: string
}

export interface ListResponse<T> {
  items: T[]
  pagination: {
    hasMore: boolean
    cursor?: string
  }
}
