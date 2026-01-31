'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Terminal, Plus, Trash2, Copy, Share2, Settings, ChevronDown, Send, Loader2, FileCode, Folder, Command } from 'lucide-react'
import type { Session } from '../types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  modelID?: string
  tokens?: {
    input: number
    output: number
    reasoning: number
    cache: number
  }
  cost?: number
  timestamp: number
}

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [model, setModel] = useState({ providerID: 'openai', modelID: 'gpt-4o' })
  const [showModelSelector, setShowModelSelector] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  // Connect to SSE when session changes
  useEffect(() => {
    if (currentSession) {
      connectToEventStream(currentSession.id)
      loadMessages(currentSession.id)
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [currentSession?.id])

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/session`)
      const data = await response.json()
      if (data.success) {
        setSessions(data.data.items)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadMessages = async (sessionID: string) => {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionID}/messages`)
      const data = await response.json()
      if (data.success) {
        const msgs: Message[] = data.data.items.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: 'content' in m ? m.content : '',
          timestamp: m.time,
          agent: 'agent' in m ? m.agent : undefined,
          modelID: 'modelID' in m ? m.modelID : undefined,
          tokens: 'tokens' in m ? m.tokens : undefined,
          cost: 'cost' in m ? m.cost : undefined,
        }))
        setMessages(msgs)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const connectToEventStream = (sessionID: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`${API_BASE}/sse/session/${sessionID}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.event === 'message.created') {
          const msg = data.data.message
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) {
              return prev
            }
            return [...prev, {
              id: msg.id,
              role: msg.role,
              content: msg.content || '',
              timestamp: msg.time,
              agent: msg.agent,
            }]
          })
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
    }
  }

  const createSession = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Session' }),
      })
      const data = await response.json()
      
      if (data.success) {
        setCurrentSession(data.data)
        setMessages([])
        loadSessions()
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitPrompt = async () => {
    if (!input.trim() || !currentSession || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    try {
      const response = await fetch(`${API_BASE}/session/${currentSession.id}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: model,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Add placeholder for assistant response
        const assistantMessage: Message = {
          id: data.data.messageID,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          agent: 'general',
          modelID: model.modelID,
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // In production, this would trigger actual AI processing
        // For demo, simulate a response
        await simulateAIResponse(assistantMessage.id, userMessage.content)
      }
    } catch (error) {
      console.error('Failed to submit prompt:', error)
      setIsStreaming(false)
    }
  }

  const simulateAIResponse = async (messageID: string, prompt: string) => {
    const responses = [
      `I've analyzed your request: "${prompt}"\n\nLet me help you with that. Here's what I can do:\n\n1. Understand your requirements\n2. Plan the implementation\n3. Write clean, efficient code\n4. Test and verify the solution`,
      `Based on your input, I understand you're looking to:\n\n• Process the request efficiently\n• Handle edge cases properly\n• Maintain clean code structure\n\nLet me work on this for you.`,
      `Great question! Here's my approach:\n\n1. First, I'll break down the problem\n2. Identify the key components\n3. Implement the solution step by step\n4. Review and optimize\n\nStarting the implementation...`,
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]
    const lines = response.split('\n')
    
    for (const line of lines) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setMessages(prev => prev.map(m => {
        if (m.id === messageID) {
          return { ...m, content: m.content + line + '\n' }
        }
        return m
      }))
    }

    setIsStreaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitPrompt()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-64'} sidebar flex flex-col transition-all duration-200`}>
        {/* Sidebar header */}
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-semibold">OpenCode</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-[var(--muted)] rounded"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>

        {/* New session button */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={createSession}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Session
                </>
              )}
            </button>
          </div>
        )}

        {/* Session list */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                Sessions
              </h3>
              <div className="space-y-1">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSession(session)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentSession?.id === session.id
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'hover:bg-[var(--muted)]'
                    }`}
                  >
                    <div className="truncate">{session.title}</div>
                    <div className="text-xs opacity-70">
                      {formatTimestamp(session.time.updated)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-[var(--border)]">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] rounded-lg">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {currentSession?.title || 'OpenCode Web'}
            </h1>
            {currentSession && (
              <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded-full">
                {currentSession.slug}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--muted)] rounded-lg hover:opacity-80"
              >
                <span>{model.providerID}/{model.modelID}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showModelSelector && (
                <div className="absolute right-0 top-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-48 z-10">
                  <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] uppercase">
                    OpenAI
                  </div>
                  <button
                    onClick={() => { setModel({ providerID: 'openai', modelID: 'gpt-4o' }); setShowModelSelector(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] ${
                      model.modelID === 'gpt-4o' ? 'text-[var(--primary)]' : ''
                    }`}
                  >
                    gpt-4o
                  </button>
                  <button
                    onClick={() => { setModel({ providerID: 'openai', modelID: 'gpt-4-turbo' }); setShowModelSelector(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] ${
                      model.modelID === 'gpt-4-turbo' ? 'text-[var(--primary)]' : ''
                    }`}
                  >
                    gpt-4-turbo
                  </button>
                  <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] uppercase border-t border-[var(--border)] mt-1">
                    Anthropic
                  </div>
                  <button
                    onClick={() => { setModel({ providerID: 'anthropic', modelID: 'claude-sonnet-4-20250506' }); setShowModelSelector(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] ${
                      model.modelID === 'claude-sonnet-4-20250506' ? 'text-[var(--primary)]' : ''
                    }`}
                  >
                    claude-sonnet-4
                  </button>
                </div>
              )}
            </div>
            
            {currentSession && (
              <>
                <button
                  onClick={() => copyToClipboard(window.location.href)}
                  className="p-2 hover:bg-[var(--muted)] rounded-lg"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-[var(--muted)] rounded-lg" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
              <Terminal className="w-16 h-16 mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Welcome to OpenCode Web</h2>
              <p className="text-center max-w-md">
                Start a new session to begin coding with AI assistance.
                Each session maintains its own context and history.
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)]'
                }`}>
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>

                {/* Message bubble */}
                <div className={`max-w-[70%]`}>
                  <div className={`message-bubble ${message.role}`}>
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {message.content || (isStreaming && message.role === 'assistant' ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </span>
                      ) : '')}
                    </pre>
                  </div>
                  
                  {/* Message metadata */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--muted-foreground)]">
                      <span>{message.agent}</span>
                      {message.modelID && <span>{message.modelID}</span>}
                      {message.tokens && (
                        <span>{message.tokens.input + message.tokens.output} tokens</span>
                      )}
                      {message.cost !== undefined && message.cost > 0 && (
                        <span>${message.cost.toFixed(4)}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentSession ? "Type your request..." : "Create a session to start"}
                disabled={!currentSession || isStreaming}
                className="terminal-input w-full min-h-[60px] max-h-[200px] p-3 bg-[var(--muted)] rounded-lg resize-none disabled:opacity-50"
                rows={Math.min(4, input.split('\n').length)}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                <Command className="w-3 h-3" />
                Enter to send
              </div>
            </div>
            
            <button
              onClick={submitPrompt}
              disabled={!input.trim() || !currentSession || isStreaming}
              className="p-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Available tools info */}
          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              read, write, edit
            </span>
            <span className="flex items-center gap-1">
              <Folder className="w-3 h-3" />
              bash, search
            </span>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              lsp, format
            </span>
          </div>
        </div>
      </div>

      {/* Resizer handle */}
      <div className="resizer w-1 hover:w-1" />
    </div>
  )
}
