'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface MessagePart {
  type: string
  text?: string
  content?: string
}

export default function OpenCodeTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'initializing' | 'ready' | 'processing' | 'error'>('initializing')
  const [errorMessage, setErrorMessage] = useState('')
  const termRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const inputBufferRef = useRef<string>('')
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const statusRef = useRef(status)
  const handleCommandRef = useRef<(command: string) => Promise<void>>(async () => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const writePrompt = useCallback(() => {
    if (termRef.current) {
      termRef.current.write('\r\n\x1b[1;36mopencode>\x1b[0m ')
    }
  }, [])

  const writeOutput = useCallback((text: string, color: string = '37') => {
    if (termRef.current) {
      const lines = text.split('\n')
      lines.forEach((line, i) => {
        termRef.current.write(`\x1b[${color}m${line}\x1b[0m`)
        if (i < lines.length - 1) {
          termRef.current.write('\r\n')
        }
      })
    }
  }, [])

  const createSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/opencode/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Terminal Session - ${new Date().toISOString()}` }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }, [])

  const sendPrompt = useCallback(async (sessionId: string, prompt: string): Promise<string> => {
    try {
      // Send the prompt
      const promptResponse = await fetch(`/api/opencode/sessions/${sessionId}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: [{ type: 'text', text: prompt }] }),
      })

      if (!promptResponse.ok) {
        throw new Error('Failed to send prompt')
      }

      // Poll for response
      let attempts = 0
      const maxAttempts = 120 // 2 minutes max wait

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++

        const sessionResponse = await fetch(`/api/opencode/sessions/${sessionId}`)
        if (!sessionResponse.ok) continue

        const sessionData = await sessionResponse.json()

        if (sessionData.messages && Array.isArray(sessionData.messages)) {
          const assistantMessages = sessionData.messages.filter((m: { role?: string }) => m.role === 'assistant')
          if (assistantMessages.length > 0) {
            const lastMsg = assistantMessages[assistantMessages.length - 1]

            let content = ''
            if (lastMsg.parts && Array.isArray(lastMsg.parts)) {
              content = lastMsg.parts
                .filter((part: MessagePart) => part.type === 'text')
                .map((part: MessagePart) => part.text || part.content || '')
                .join('\n')
            } else if (lastMsg.content) {
              content = lastMsg.content
            }

            if (content) {
              return content
            }
          }
        }
      }

      return 'Response timeout. The server may be processing your request.'
    } catch (error) {
      console.error('Failed to send prompt:', error)
      return `Error: ${String(error)}`
    }
  }, [])

  const handleCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim()

    if (!trimmedCommand) {
      writePrompt()
      return
    }

    // Add to history
    historyRef.current.push(trimmedCommand)
    historyIndexRef.current = historyRef.current.length

    // Handle built-in commands
    if (trimmedCommand === 'clear' || trimmedCommand === 'cls') {
      termRef.current?.clear()
      writePrompt()
      return
    }

    if (trimmedCommand === 'help') {
      writeOutput('\r\n\x1b[1;33mOpenCode Terminal Commands:\x1b[0m\r\n')
      writeOutput('  help     - Show this help message\r\n')
      writeOutput('  clear    - Clear the terminal\r\n')
      writeOutput('  new      - Start a new session\r\n')
      writeOutput('  exit     - Close the terminal\r\n')
      writeOutput('\r\nType any other text to chat with OpenCode AI.\r\n')
      writePrompt()
      return
    }

    if (trimmedCommand === 'new') {
      setStatus('processing')
      writeOutput('\r\n\x1b[33mCreating new session...\x1b[0m')

      const newSessionId = await createSession()
      if (newSessionId) {
        setCurrentSessionId(newSessionId)
        writeOutput(`\r\n\x1b[32m✓ New session created: ${newSessionId.substring(0, 16)}...\x1b[0m`)
      } else {
        writeOutput('\r\n\x1b[31m✗ Failed to create session\x1b[0m')
      }

      setStatus('ready')
      writePrompt()
      return
    }

    if (trimmedCommand === 'exit') {
      writeOutput('\r\n\x1b[33mGoodbye!\x1b[0m\r\n')
      return
    }

    // Send to OpenCode
    setStatus('processing')

    // Create session if needed
    let sessionId = currentSessionId
    if (!sessionId) {
      writeOutput('\r\n\x1b[33mCreating session...\x1b[0m')
      sessionId = await createSession()
      if (sessionId) {
        setCurrentSessionId(sessionId)
        writeOutput('\x1b[32m done\x1b[0m')
      } else {
        writeOutput('\r\n\x1b[31m✗ Failed to create session. Please try again.\x1b[0m')
        setStatus('ready')
        writePrompt()
        return
      }
    }

    writeOutput('\r\n\x1b[90mThinking...\x1b[0m')

    const response = await sendPrompt(sessionId, trimmedCommand)

    // Clear "Thinking..." and write response
    termRef.current?.write('\r\x1b[K') // Clear current line
    writeOutput(`\r\n\x1b[37m${response}\x1b[0m`)

    setStatus('ready')
    writePrompt()
  }, [currentSessionId, createSession, sendPrompt, writeOutput, writePrompt])

  // Keep handleCommandRef in sync
  useEffect(() => {
    handleCommandRef.current = handleCommand
  }, [handleCommand])

  useEffect(() => {
    if (!mounted || !terminalRef.current) return
    let isMounted = true

    const initTerminal = async () => {
      if (!terminalRef.current || !isMounted) return

      try {
        setStatus('initializing')

        const xtermModule = await import('xterm')
        const fitAddonModule = await import('xterm-addon-fit')

        const { Terminal } = xtermModule
        const { FitAddon } = fitAddonModule

        const term = new Terminal({
          cursorBlink: true,
          cursorStyle: 'bar' as const,
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
          fontSize: 14,
          lineHeight: 1.3,
          theme: {
            background: '#0D1117',
            foreground: '#E6EDF3',
            cursor: '#58A6FF',
            cursorAccent: '#0D1117',
            selectionBackground: '#264F78',
            black: '#484F58',
            red: '#FF7B72',
            green: '#7EE787',
            yellow: '#D29922',
            blue: '#58A6FF',
            magenta: '#BC8CFF',
            cyan: '#76E3EA',
            white: '#B1BAC4',
            brightBlack: '#6E7681',
            brightRed: '#FFA198',
            brightGreen: '#A5D6A7',
            brightYellow: '#E3B341',
            brightBlue: '#79C0FF',
            brightMagenta: '#D2A8FF',
            brightCyan: '#A5F3FC',
            brightWhite: '#F0F6FC',
          },
          allowTransparency: true,
          scrollback: 10000,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)

        // Delay fit() to ensure DOM is fully rendered with dimensions
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!isMounted) {
          term.dispose()
          return
        }

        // Safe fit with error handling
        const safeFit = () => {
          try {
            if (terminalRef.current && terminalRef.current.offsetWidth > 0 && terminalRef.current.offsetHeight > 0) {
              fitAddon.fit()
            }
          } catch (e) {
            console.warn('FitAddon fit error:', e)
          }
        }

        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          safeFit()
        })

        if (!isMounted) {
          term.dispose()
          return
        }

        termRef.current = term
        fitAddonRef.current = fitAddon

        // Welcome message
        term.write('\x1b[1;34m')
        term.write('╔═══════════════════════════════════════════════════════════╗\r\n')
        term.write('║                                                           ║\r\n')
        term.write('║   \x1b[1;36m🚀 OpenCode Terminal\x1b[1;34m                                  ║\r\n')
        term.write('║                                                           ║\r\n')
        term.write('║   \x1b[0;37mAI-powered coding assistant in your browser\x1b[1;34m            ║\r\n')
        term.write('║                                                           ║\r\n')
        term.write('║   \x1b[0;90mType "help" for commands, or just start chatting\x1b[1;34m       ║\r\n')
        term.write('║                                                           ║\r\n')
        term.write('╚═══════════════════════════════════════════════════════════╝\r\n')
        term.write('\x1b[0m')

        // Connect to server
        term.write('\r\n\x1b[33mConnecting to OpenCode server...\x1b[0m')

        try {
          const healthResponse = await fetch('/api/proxy/global/health')
          if (healthResponse.ok) {
            const healthData = await healthResponse.json()
            term.write(`\x1b[32m connected (v${healthData.version || 'unknown'})\x1b[0m\r\n`)
          } else {
            throw new Error('Health check failed')
          }
        } catch {
          term.write('\x1b[31m failed\x1b[0m\r\n')
          term.write('\x1b[33mRunning in offline mode. Some features may not work.\x1b[0m\r\n')
        }

        setStatus('ready')
        term.write('\r\n\x1b[1;36mopencode>\x1b[0m ')
        term.focus()

        // Handle input
        term.onData((data) => {
          if (statusRef.current === 'processing') return

          const code = data.charCodeAt(0)

          if (code === 13) { // Enter
            const command = inputBufferRef.current
            inputBufferRef.current = ''
            handleCommandRef.current(command)
          } else if (code === 127 || code === 8) { // Backspace
            if (inputBufferRef.current.length > 0) {
              inputBufferRef.current = inputBufferRef.current.slice(0, -1)
              term.write('\b \b')
            }
          } else if (code === 27) { // Escape sequences (arrows, etc.)
            if (data === '\x1b[A') { // Up arrow
              if (historyIndexRef.current > 0) {
                historyIndexRef.current--
                const historyItem = historyRef.current[historyIndexRef.current]
                // Clear current input
                term.write('\r\x1b[K\x1b[1;36mopencode>\x1b[0m ' + historyItem)
                inputBufferRef.current = historyItem
              }
            } else if (data === '\x1b[B') { // Down arrow
              if (historyIndexRef.current < historyRef.current.length - 1) {
                historyIndexRef.current++
                const historyItem = historyRef.current[historyIndexRef.current]
                term.write('\r\x1b[K\x1b[1;36mopencode>\x1b[0m ' + historyItem)
                inputBufferRef.current = historyItem
              } else {
                historyIndexRef.current = historyRef.current.length
                term.write('\r\x1b[K\x1b[1;36mopencode>\x1b[0m ')
                inputBufferRef.current = ''
              }
            }
          } else if (code === 3) { // Ctrl+C
            inputBufferRef.current = ''
            term.write('^C')
            term.write('\r\n\x1b[1;36mopencode>\x1b[0m ')
          } else if (code >= 32) { // Printable characters
            inputBufferRef.current += data
            term.write(data)
          }
        })

        // Handle resize with safe fit
        const handleResize = () => {
          requestAnimationFrame(() => {
            safeFit()
          })
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
        }

      } catch (error) {
        console.error('Failed to initialize terminal:', error)
        setStatus('error')
        setErrorMessage(String(error))
      }
    }

    initTerminal()

    return () => {
      isMounted = false
      if (termRef.current) {
        termRef.current.dispose()
      }
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading terminal...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.statusBar}>
        <div style={getStatusBadgeStyle(status)}>
          <span style={getStatusDotStyle(status)}></span>
          {status === 'initializing' && 'Initializing...'}
          {status === 'ready' && 'Ready'}
          {status === 'processing' && 'Processing...'}
          {status === 'error' && 'Error'}
        </div>
        {currentSessionId && (
          <div style={styles.sessionInfo}>
            Session: {currentSessionId.substring(0, 16)}...
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <div style={styles.terminalWrapper}>
        <div style={styles.terminalHeader}>
          <div style={styles.terminalButtons}>
            <span style={{ ...styles.terminalButton, backgroundColor: '#FF5F57' }}></span>
            <span style={{ ...styles.terminalButton, backgroundColor: '#FFBD2E' }}></span>
            <span style={{ ...styles.terminalButton, backgroundColor: '#28CA41' }}></span>
          </div>
          <span style={styles.terminalTitle}>OpenCode Terminal</span>
        </div>
        <div
          ref={terminalRef}
          style={styles.terminalContainer}
        />
      </div>

      <div style={styles.helpSection}>
        <h3 style={styles.helpTitle}>Quick Reference</h3>
        <div style={styles.helpGrid}>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Enter</kbd>
            <span style={styles.helpDesc}>Send</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>↑ / ↓</kbd>
            <span style={styles.helpDesc}>History</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Ctrl+C</kbd>
            <span style={styles.helpDesc}>Cancel</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>help</kbd>
            <span style={styles.helpDesc}>Commands</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  backgroundColor: status === 'ready' ? 'rgba(52, 199, 89, 0.15)'
                   : status === 'processing' || status === 'initializing' ? 'rgba(255, 149, 0, 0.15)'
                   : 'rgba(255, 69, 58, 0.15)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: status === 'ready' ? '#34C759'
         : status === 'processing' || status === 'initializing' ? '#FF9500'
         : '#FF453A',
})

const getStatusDotStyle = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: status === 'ready' ? '#34C759'
                   : status === 'processing' || status === 'initializing' ? '#FF9500'
                   : '#FF453A',
  animation: (status === 'processing' || status === 'initializing') ? 'pulse 1.5s ease-in-out infinite' : 'none',
})

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
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
  sessionInfo: {
    fontSize: '12px',
    color: '#86868B',
    fontFamily: 'SF Mono, Monaco, monospace',
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
  terminalWrapper: {
    backgroundColor: '#0D1117',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '24px',
  },
  terminalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#161B22',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  terminalButtons: {
    display: 'flex',
    gap: '8px',
  },
  terminalButton: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  terminalTitle: {
    fontSize: '13px',
    color: '#86868B',
  },
  terminalContainer: {
    padding: '16px',
    minHeight: '450px',
    height: '450px',
    maxHeight: '60vh',
    overflow: 'hidden',
    width: '100%',
  },
  helpSection: {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  helpTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#F5F5F7',
  },
  helpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  helpItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  kbd: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '12px',
    color: '#F5F5F7',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  helpDesc: {
    fontSize: '13px',
    color: '#86868B',
  },
}
