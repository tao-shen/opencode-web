'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = typeof window === 'undefined' 
  ? '' 
  : window.location.origin + '/api'

interface Session {
  id: string
  slug: string
  title: string
  status: string
  time: { created: number; updated: number }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  modelID?: string
  timestamp: number
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: '256px',
    backgroundColor: '#1e293b',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s',
  },
  sidebarCollapsed: {
    width: '48px',
  },
  sidebarHeader: {
    padding: '12px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '14px',
  },
  newSessionBtn: {
    width: 'calc(100% - 24px)',
    margin: '12px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  sessionItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    fontSize: '14px',
    transition: 'background-color 0.15s',
  },
  sessionItemActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  sessionItemInactive: {
    backgroundColor: 'transparent',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  },
  header: {
    height: '56px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modelSelector: {
    position: 'relative' as const,
  },
  modelBtn: {
    padding: '6px 12px',
    backgroundColor: '#334155',
    border: 'none',
    borderRadius: '6px',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  modelDropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '8px 0',
    minWidth: '192px',
    zIndex: 50,
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  modelSection: {
    padding: '8px 12px',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  modelOption: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#e2e8f0',
  },
  iconBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  welcomeScreen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    textAlign: 'center' as const,
  },
  welcomeIcon: {
    width: '64px',
    height: '64px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  welcomeTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#f1f5f9',
  },
  welcomeText: {
    maxWidth: '400px',
    lineHeight: 1.6,
  },
  messageRow: {
    display: 'flex',
    gap: '12px',
    maxWidth: '70%',
  },
  messageRowUser: {
    marginLeft: 'auto',
    flexDirection: 'row-reverse' as const,
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  avatarUser: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  avatarAssistant: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  bubbleUser: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  bubbleAssistant: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
  },
  inputArea: {
    padding: '16px 24px',
    borderTop: '1px solid #334155',
    backgroundColor: '#1e293b',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none' as const,
    outline: 'none',
    minHeight: '48px',
    maxHeight: '160px',
  },
  sendBtn: {
    padding: '12px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsInfo: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
    fontSize: '12px',
    color: '#64748b',
  },
  toolTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  loadingSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingDots: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id)
    }
  }, [currentSession?.id])

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/session`)
      const data = await response.json()
      if (data.success) {
        setSessions(data.data.items || [])
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
        const msgs: Message[] = (data.data.items || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content || '',
          timestamp: m.time,
          agent: m.agent,
        }))
        setMessages(msgs)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
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
        const assistantMessage: Message = {
          id: data.data.messageID,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          agent: 'general',
        }
        setMessages(prev => [...prev, assistantMessage])
        
        await simulateAIResponse(assistantMessage.id, userMessage.content)
      }
    } catch (error) {
      console.error('Failed to submit prompt:', error)
      setIsStreaming(false)
    }
  }

  const simulateAIResponse = async (messageID: string, prompt: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const responses = [
      `I understand you're asking about: "${prompt}"\n\nThis is a simulated AI response. Configure your API keys to enable real AI responses.`,
      `Based on your request, here's what I can help you with:\n\n1. Analyzing your input\n2. Processing the context\n3. Generating relevant responses`,
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const models = [
    { provider: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { provider: 'Anthropic', models: ['claude-sonnet-4-20250506', 'claude-opus-4-20250506'] },
  ]

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, ...(sidebarCollapsed ? styles.sidebarCollapsed : {}) }}>
        <div style={styles.sidebarHeader}>
          {!sidebarCollapsed && (
            <div style={styles.sidebarTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              OpenCode
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ ...styles.iconBtn, transform: sidebarCollapsed ? 'rotate(180deg)' : 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <button onClick={createSession} disabled={isLoading} style={styles.newSessionBtn}>
              {isLoading ? (
                <span style={styles.loadingSpinner}>
                  <span style={styles.loadingDots}></span>
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Session
                </>
              )}
            </button>

            <div style={styles.sessionList}>
              <div style={{ padding: '8px 12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                Sessions
              </div>
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSession(session)}
                  style={{
                    ...styles.sessionItem,
                    ...(currentSession?.id === session.id ? styles.sessionItemActive : styles.sessionItemInactive),
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                    {formatTime(session.time.updated)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #334155' }}>
              <button style={{ width: '100%', padding: '10px 12px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={styles.headerTitle}>
              {currentSession?.title || 'OpenCode Web'}
            </h1>
            {currentSession && (
              <span style={{ padding: '2px 8px', backgroundColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#94a3b8' }}>
                {currentSession.slug}
              </span>
            )}
          </div>
          
          <div style={styles.headerActions}>
            <div style={styles.modelSelector}>
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                style={styles.modelBtn}
              >
                {model.providerID}/{model.modelID}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              {showModelSelector && (
                <div style={styles.modelDropdown}>
                  {models.map(group => (
                    <div key={group.provider}>
                      <div style={styles.modelSection}>{group.provider}</div>
                      {group.models.map(m => (
                        <button
                          key={m}
                          onClick={() => { setModel({ providerID: group.provider.toLowerCase(), modelID: m }); setShowModelSelector(false); }}
                          style={{
                            ...styles.modelOption,
                            color: model.modelID === m ? '#3b82f6' : '#e2e8f0',
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {currentSession && (
              <>
                <button style={styles.iconBtn} title="Copy link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                <button style={styles.iconBtn} title="Share">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div style={styles.messagesArea}>
          {messages.length === 0 ? (
            <div style={styles.welcomeScreen}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={styles.welcomeIcon}>
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <h2 style={styles.welcomeTitle}>Welcome to OpenCode Web</h2>
              <p style={styles.welcomeText}>
                Start a new session to begin coding with AI assistance.
                Each session maintains its own context and history.
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                style={{
                  ...styles.messageRow,
                  ...(message.role === 'user' ? styles.messageRowUser : {}),
                }}
              >
                <div style={{ ...styles.avatar, ...(message.role === 'user' ? styles.avatarUser : styles.avatarAssistant) }}>
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>
                <div>
                  <div style={{ ...styles.messageBubble, ...(message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant) }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                      {message.content || (isStreaming && message.role === 'assistant' ? (
                        <span style={styles.loadingSpinner}>
                          <span style={{ ...styles.loadingDots, animationDelay: '0s' }}></span>
                          <span style={{ ...styles.loadingDots, animationDelay: '0.2s' }}></span>
                          <span style={{ ...styles.loadingDots, animationDelay: '0.4s' }}></span>
                        </span>
                      ) : '')}
                    </pre>
                  </div>
                  {message.role === 'assistant' && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span>{message.agent}</span>
                      <span>{message.modelID}</span>
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentSession ? "Type your request..." : "Create a session to start"}
              disabled={!currentSession || isStreaming}
              style={{
                ...styles.input,
                opacity: (!currentSession || isStreaming) ? 0.5 : 1,
                cursor: (!currentSession || isStreaming) ? 'not-allowed' : 'text',
              }}
              rows={Math.min(4, input.split('\n').length)}
            />
            <button
              onClick={submitPrompt}
              disabled={!input.trim() || !currentSession || isStreaming}
              style={{
                ...styles.sendBtn,
                opacity: (!input.trim() || !currentSession || isStreaming) ? 0.5 : 1,
                cursor: (!input.trim() || !currentSession || isStreaming) ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          
          <div style={styles.toolsInfo}>
            <span style={styles.toolTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              read, write, edit
            </span>
            <span style={styles.toolTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              bash, search
            </span>
            <span style={styles.toolTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              lsp, format
            </span>
          </div>
        </div>
      </div>

      {showModelSelector && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
          onClick={() => setShowModelSelector(false)}
        />
      )}
    </div>
  )
}
