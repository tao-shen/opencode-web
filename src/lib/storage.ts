import Redis from 'ioredis'

// Global Redis client singleton
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL
    if (!url) {
      throw new Error('REDIS_URL environment variable is not set')
    }
  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  })
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err)
    })
    
    redisClient.on('connect', () => {
      console.log('Redis connected')
    })
  }
  
  return redisClient
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// Session storage utilities
const SESSION_PREFIX = 'opencode:session:'
const MESSAGE_PREFIX = 'opencode:message:'
const PART_PREFIX = 'opencode:part:'

export interface SessionStorage {
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
  permission?: Record<string, unknown>
  status: string
}

export async function createSession(session: SessionStorage): Promise<void> {
  const redis = getRedisClient()
  const key = `${SESSION_PREFIX}${session.id}`
  const slugKey = `${SESSION_PREFIX}slug:${session.slug}`
  
  await redis.hset(key, {
    id: session.id,
    slug: session.slug,
    title: session.title,
    projectID: session.projectID,
    directory: session.directory,
    parentID: session.parentID || '',
    version: session.version,
    created: session.time.created.toString(),
    updated: session.time.updated.toString(),
    permission: JSON.stringify(session.permission || {}),
    status: session.status,
  })
  
  await redis.set(slugKey, session.id)
}

export async function getSession(sessionID: string): Promise<SessionStorage | null> {
  const redis = getRedisClient()
  const key = `${SESSION_PREFIX}${sessionID}`
  const data = await redis.hgetall(key)
  
  if (!data.id) {
    return null
  }
  
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    projectID: data.projectID,
    directory: data.directory,
    parentID: data.parentID || undefined,
    version: data.version,
    time: {
      created: parseInt(data.created),
      updated: parseInt(data.updated),
    },
    permission: JSON.parse(data.permission || '{}'),
    status: data.status,
  }
}

export async function getSessionBySlug(slug: string): Promise<SessionStorage | null> {
  const redis = getRedisClient()
  const sessionID = await redis.get(`${SESSION_PREFIX}slug:${slug}`)
  
  if (!sessionID) {
    return null
  }
  
  return getSession(sessionID)
}

export async function listSessions(projectID: string, limit = 20): Promise<SessionStorage[]> {
  const redis = getRedisClient()
  const pattern = `${SESSION_PREFIX}*`
  const sessions: SessionStorage[] = []
  
  const keys = await redis.keys(pattern)
  
  for (const key of keys.slice(0, limit * 2)) {
    if (key.includes(':slug:')) continue
    
    const data = await redis.hgetall(key)
    if (data.projectID === projectID) {
      sessions.push({
        id: data.id,
        slug: data.slug,
        title: data.title,
        projectID: data.projectID,
        directory: data.directory,
        parentID: data.parentID || undefined,
        version: data.version,
        time: {
          created: parseInt(data.created),
          updated: parseInt(data.updated),
        },
        permission: JSON.parse(data.permission || '{}'),
        status: data.status,
      })
    }
  }
  
  return sessions.slice(0, limit)
}

export async function updateSessionStatus(sessionID: string, status: string): Promise<void> {
  const redis = getRedisClient()
  await redis.hset(`${SESSION_PREFIX}${sessionID}`, 'status', status)
}

export async function deleteSession(sessionID: string): Promise<void> {
  const redis = getRedisClient()
  const session = await getSession(sessionID)
  
  if (session) {
    await redis.del(`${SESSION_PREFIX}${sessionID}`)
    await redis.del(`${SESSION_PREFIX}slug:${session.slug}`)
  }
}

// Message storage
export interface MessageStorage {
  id: string
  sessionID: string
  role: 'user' | 'assistant'
  agent: string
  modelID: string
  providerID: string
  parentID?: string
  content: string
  cost: number
  tokens: string
  error?: string
  summary?: boolean
  time: number
}

export async function createMessage(message: MessageStorage): Promise<void> {
  const redis = getRedisClient()
  const key = `${MESSAGE_PREFIX}${message.id}`
  
  await redis.hset(key, {
    id: message.id,
    sessionID: message.sessionID,
    role: message.role,
    agent: message.agent,
    modelID: message.modelID,
    providerID: message.providerID,
    parentID: message.parentID || '',
    content: message.content,
    cost: message.cost.toString(),
    tokens: JSON.stringify(message.tokens),
    error: message.error || '',
    summary: message.summary?.toString() || '',
    time: message.time.toString(),
  })
}

export async function getMessage(messageID: string): Promise<MessageStorage | null> {
  const redis = getRedisClient()
  const key = `${MESSAGE_PREFIX}${messageID}`
  const data = await redis.hgetall(key)
  
  if (!data.id) {
    return null
  }
  
  return {
    id: data.id,
    sessionID: data.sessionID,
    role: data.role as 'user' | 'assistant',
    agent: data.agent,
    modelID: data.modelID,
    providerID: data.providerID,
    parentID: data.parentID || undefined,
    content: data.content,
    cost: parseFloat(data.cost),
    tokens: JSON.parse(data.tokens),
    error: data.error || undefined,
    summary: data.summary === 'true' ? true : undefined,
    time: parseInt(data.time),
  }
}

export async function listMessages(sessionID: string, limit = 50): Promise<MessageStorage[]> {
  const redis = getRedisClient()
  const pattern = `${MESSAGE_PREFIX}*`
  const messages: MessageStorage[] = []
  
  const keys = await redis.keys(pattern)
  
  for (const key of keys) {
    const data = await redis.hgetall(key)
    if (data.sessionID === sessionID) {
      messages.push({
        id: data.id,
        sessionID: data.sessionID,
        role: data.role as 'user' | 'assistant',
        agent: data.agent,
        modelID: data.modelID,
        providerID: data.providerID,
        parentID: data.parentID || undefined,
        content: data.content,
        cost: parseFloat(data.cost),
        tokens: JSON.parse(data.tokens),
        error: data.error || undefined,
        summary: data.summary === 'true' ? true : undefined,
        time: parseInt(data.time),
      })
    }
  }
  
  return messages
    .sort((a, b) => b.time - a.time)
    .slice(0, limit)
    .reverse()
}

// Event pub/sub for SSE
export async function publishEvent(channel: string, event: string, data: unknown): Promise<void> {
  const redis = getRedisClient()
  await redis.publish(channel, JSON.stringify({ event, data }))
}

export function subscribeToChannel(channel: string): AsyncIterable<{ event: string; data: unknown }> {
  const redis = getRedisClient()
  const subscriber = redis.duplicate()
  
  return {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<{ done: boolean; value: { event: string; data: unknown } }> {
          const message = await subscriber.blpop(channel, 0)
          
          if (message) {
            const parsed = JSON.parse(message[1])
            return { done: false, value: parsed }
          }
          
          return { done: true, value: { event: '', data: null } }
        },
      }
    },
  }
}
