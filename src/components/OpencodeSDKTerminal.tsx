'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { opencodeClient } from '@/lib/opencode-sdk'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface Session {
  id: string
  title: string
  createdAt: Date
}

interface MessagePart {
  type: string
  text?: string
  content?: string
}

export default function OpencodeSDKTerminal() {
  const [status, setStatus] = useState<'initializing' | 'connecting' | 'connected' | 'error'>('initializing')
  const [errorMessage, setErrorMessage] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [mounted, setMounted] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let isMounted = true

    const initClient = async () => {
      try {
        setStatus('initializing')
        setStatus('connecting')

        await opencodeClient.session.list()

        if (!isMounted) return

        setStatus('connected')

        await loadSessions()

      } catch (error) {
        console.error('Failed to initialize OpenCode client:', error)
        if (!isMounted) return
        setStatus('error')
        setErrorMessage(String(error))
      }
    }

    initClient()

    return () => {
      isMounted = false
    }
  }, [mounted])

  const loadSessions = async () => {
    try {
      const result = await opencodeClient.session.list()
      const sessionList = result.data || []
      const formattedSessions = sessionList.map((s: any) => ({
        id: s.id || String(Math.random()),
        title: s.title || s.slug || 'New Session',
        createdAt: s.time?.created ? new Date(s.time.created) : (s.createdAt ? new Date(s.createdAt) : new Date())
      }))
      setSessions(formattedSessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const result = await opencodeClient.session.messages({ path: { id: sessionId } })
      const messages = result.data || []

      const formattedMessages: Message[] = messages.map((msg: any, idx: number) => {
        let content = ''
        if (msg.parts && Array.isArray(msg.parts)) {
          content = msg.parts
            .filter((part: MessagePart) => part.type === 'text')
            .map((part: MessagePart) => part.text || part.content || '')
            .join('\n')
        } else if (msg.content) {
          content = msg.content
        }

        return {
          id: msg.id || `${sessionId}-${idx}`,
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content,
          timestamp: msg.time?.created ? new Date(msg.time.created) : new Date()
        }
      })
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Failed to load session messages:', error)
    }
  }, [])

  const createNewSession = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const result = await opencodeClient.session.create({
        body: { title: `New session - ${new Date().toISOString()}` }
      })

      const data = result.data
      if (!data) {
        throw new Error('Failed to create session: no data returned')
      }

      const newSession = {
        id: data.id,
        title: data.title || 'New Session',
        createdAt: data.time?.created ? new Date(data.time.created) : new Date()
      }

      setSessions(prev => [...prev, newSession])
      setCurrentSession(newSession)
      setMessages([])

    } catch (error) {
      console.error('Failed to create session:', error)
      setErrorMessage('Failed to create session: ' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentSession || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsLoading(true)
    setStreamingContent('')

    // Add placeholder for assistant response
    const assistantPlaceholderId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }])

    try {
      // Send prompt to session
      await opencodeClient.session.prompt({
        path: { id: currentSession.id },
        body: { parts: [{ type: 'text', text: messageText }] }
      })

      // Poll for response (simple approach, could be enhanced with SSE)
      let attempts = 0
      const maxAttempts = 60 // 60 seconds max wait
      let gotResponse = false

      while (attempts < maxAttempts && !gotResponse) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++

        try {
          const result = await opencodeClient.session.messages({ path: { id: currentSession.id } })
          const messages = result.data || []

          const assistantMessages = messages.filter((m: any) => m.role === 'assistant')
          if (assistantMessages.length > 0) {
            const lastAssistantMsg = assistantMessages[assistantMessages.length - 1] as any

            let content = ''
            if (lastAssistantMsg.parts && Array.isArray(lastAssistantMsg.parts)) {
              content = lastAssistantMsg.parts
                .filter((part: MessagePart) => part.type === 'text')
                .map((part: MessagePart) => part.text || part.content || '')
                .join('\n')
            } else if (lastAssistantMsg.info) {
              content = lastAssistantMsg.info.content || ''
            }

            if (content) {
              setMessages(prev => prev.map(msg =>
                msg.id === assistantPlaceholderId
                  ? { ...msg, content, isStreaming: false }
                  : msg
              ))
              gotResponse = true
            }
          }
        } catch (pollError) {
          console.error('Polling error:', pollError)
        }
      }

      if (!gotResponse) {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantPlaceholderId
            ? { ...msg, content: 'Response timeout. Please check if the server processed your request.', isStreaming: false }
            : msg
        ))
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantPlaceholderId
          ? { ...msg, content: `Error: ${String(error)}`, isStreaming: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!mounted) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading OpenCode...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={getStatusBadgeStyle(status)}>
          <span style={getStatusDotStyle(status)}></span>
          {status === 'initializing' && 'Initializing...'}
          {status === 'connecting' && 'Connecting to server...'}
          {status === 'connected' && 'Connected to OpenCode'}
          {status === 'error' && 'Connection Error'}
        </div>

        {status === 'connected' && (
          <button style={styles.newSessionButton} onClick={createNewSession}>
            + New Session
          </button>
        )}
      </div>

      {errorMessage && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Main Content */}
      {status === 'connected' && (
        <div style={styles.mainContent}>
          {/* Sidebar with Sessions */}
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Sessions</h3>
            <div style={styles.sessionList}>
              {sessions.length === 0 && (
                <p style={styles.noSessions}>No sessions yet. Create one to start!</p>
              )}
              {sessions.map(session => (
                <button
                  key={session.id}
                  style={{
                    ...styles.sessionItem,
                    ...(currentSession?.id === session.id ? styles.sessionItemActive : {})
                  }}
                  onClick={() => {
                    setCurrentSession(session)
                    setMessages([])
                    loadSessionMessages(session.id)
                  }}
                >
                  <div style={styles.sessionTitle}>{session.title}</div>
                  <div style={styles.sessionTime}>
                    {session.createdAt.toLocaleTimeString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div style={styles.chatArea}>
            {!currentSession ? (
              <div style={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 style={styles.emptyStateTitle}>No session selected</h3>
                <p style={styles.emptyStateDesc}>Create a new session to start chatting with OpenCode</p>
                <button style={styles.createButton} onClick={createNewSession}>
                  Create Session
                </button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div style={styles.messagesContainer}>
                  {messages.length === 0 && (
                    <div style={styles.welcomeMessage}>
                      <h3 style={styles.welcomeTitle}>
                        Welcome to {currentSession.title}
                      </h3>
                      <p style={styles.welcomeDesc}>
                        Start chatting with OpenCode AI assistant
                      </p>
                    </div>
                  )}

                  {messages.map(message => (
                    <div
                      key={message.id}
                      style={message.role === 'user' ? styles.userMessage : styles.assistantMessage}
                    >
                      <div style={styles.messageHeader}>
                        <span style={styles.messageRole}>
                          {message.role === 'user' ? 'You' : 'OpenCode'}
                        </span>
                        <span style={styles.messageTime}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.isStreaming && (
                          <span style={styles.streamingBadge}>Thinking...</span>
                        )}
                      </div>
                      <div style={styles.messageContent}>
                        {message.isStreaming && !message.content ? (
                          <div style={styles.typingIndicator}>
                            <span style={styles.dot}></span>
                            <span style={styles.dot}></span>
                            <span style={styles.dot}></span>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={styles.inputArea}>
                  <textarea
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                  />
                  <button
                    style={{
                      ...styles.sendButton,
                      ...((!inputValue.trim() || isLoading) ? styles.sendButtonDisabled : {})
                    }}
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  backgroundColor: status === 'connected' ? 'rgba(52, 199, 89, 0.15)'
                   : status === 'connecting' || status === 'initializing' ? 'rgba(255, 149, 0, 0.15)'
                   : 'rgba(255, 69, 58, 0.15)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: status === 'connected' ? '#34C759'
         : status === 'connecting' || status === 'initializing' ? '#FF9500'
         : '#FF453A',
})

const getStatusDotStyle = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: status === 'connected' ? '#34C759'
                   : status === 'connecting' || status === 'initializing' ? '#FF9500'
                   : '#FF453A',
  animation: (status === 'connecting' || status === 'initializing') ? 'pulse 1.5s ease-in-out infinite' : 'none',
})

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1117',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 122, 255, 0.2)',
    borderTopColor: '#007AFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    color: '#86868B',
    fontSize: '14px',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  newSessionButton: {
    padding: '8px 16px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorBox: {
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    border: '1px solid rgba(255, 69, 58, 0.3)',
    borderRadius: '8px',
    color: '#FF453A',
    fontSize: '13px',
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '16px',
  },
  sessionList: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  noSessions: {
    fontSize: '13px',
    color: '#86868B',
    textAlign: 'center',
    padding: '20px',
  },
  sessionItem: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  sessionItemActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  sessionTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#F5F5F7',
    marginBottom: '4px',
  },
  sessionTime: {
    fontSize: '12px',
    color: '#86868B',
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginTop: '20px',
    marginBottom: '8px',
  },
  emptyStateDesc: {
    fontSize: '14px',
    color: '#86868B',
    marginBottom: '24px',
  },
  createButton: {
    padding: '10px 24px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  welcomeTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '8px',
  },
  welcomeDesc: {
    fontSize: '14px',
    color: '#86868B',
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '70%',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: '16px',
    padding: '12px 16px',
    border: '1px solid rgba(0, 122, 255, 0.2)',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '12px 16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  messageRole: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#007AFF',
  },
  messageTime: {
    fontSize: '11px',
    color: '#86868B',
  },
  messageContent: {
    fontSize: '14px',
    color: '#F5F5F7',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  typingIndicator: {
    display: 'flex',
    gap: '6px',
    padding: '8px 0',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#007AFF',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  streamingBadge: {
    fontSize: '10px',
    color: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: '8px',
  },
  inputArea: {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#F5F5F7',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
