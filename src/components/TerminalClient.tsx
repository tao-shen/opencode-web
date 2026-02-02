'use client'

import { useEffect, useRef, useState } from 'react'

interface PtyInfo {
  id: string
  title: string
  command: string
  args: string[]
  cwd: string
  status: 'running' | 'exited'
  pid: number
}

export default function TerminalClient() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'initializing' | 'creating-pty' | 'connecting' | 'connected' | 'disconnected' | 'error'>('initializing')
  const [errorMessage, setErrorMessage] = useState('')
  const termRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const resizeHandlerRef = useRef<(() => void) | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          lineHeight: 1.2,
          theme: {
            background: '#000000',
            foreground: '#00FF00',
            cursor: '#00FF00',
            cursorAccent: '#003300',
            selectionBackground: '#333333',
            black: '#000000',
            red: '#FF5555',
            green: '#50FA7B',
            yellow: '#F1FA8C',
            blue: '#BD93F9',
            magenta: '#FF79C6',
            cyan: '#8BE9FD',
            white: '#F8F8F2',
            brightBlack: '#6272A4',
            brightRed: '#FF6E6E',
            brightGreen: '#69FF94',
            brightYellow: '#FFFFA5',
            brightBlue: '#D6ACFF',
            brightMagenta: '#FF92DF',
            brightCyan: '#A4FFFF',
            brightWhite: '#FFFFFF',
          },
          allowTransparency: true,
          scrollback: 5000,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)
        fitAddon.fit()

        if (!isMounted) {
          term.dispose()
          return
        }

        termRef.current = term
        term.write('\r\n\x1b[1;34m🚀 Initializing OpenCode Terminal...\x1b[0m\r\n')

        setStatus('creating-pty')
        term.write('\r\n\x1b[33mCreating PTY session...\x1b[0m\r\n')

        const ptyResponse = await fetch('https://nngpveejjssh.eu-central-1.clawcloudrun.com/pty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Web Terminal',
            cwd: '/',
          }),
        })

        if (!ptyResponse.ok) {
          throw new Error(`Failed to create PTY: ${ptyResponse.statusText}`)
        }

        const ptyInfo: PtyInfo = await ptyResponse.json()
        term.write(`\x1b[32m✓ PTY created: ${ptyInfo.id}\x1b[0m\r\n`)

        const wsUrl = `wss://opencode.tao-shen.com/pty/${ptyInfo.id}/connect`
        
        setStatus('connecting')
        term.write(`\r\n\x1b[33mConnecting to ${wsUrl}...\x1b[0m\r\n`)

        const socket = new WebSocket(wsUrl)
        wsRef.current = socket

        socket.onopen = () => {
          if (!isMounted) return
          setStatus('connected')
          term.write('\r\n\x1b[1;32m✅ Connected to OpenCode!\x1b[0m\r\n\r\n')
          term.focus()
        }

        socket.onmessage = (event) => {
          if (!isMounted) return
          term.write(event.data)
        }

        socket.onclose = (event) => {
          if (!isMounted) return
          setStatus('disconnected')
          term.write(`\r\n\x1b[1;31m❌ Connection closed (code: ${event.code})\x1b[0m\r\n`)
          term.write('\r\n\x1b[33mTo reconnect, refresh the page\x1b[0m\r\n')
        }

        socket.onerror = (error) => {
          if (!isMounted) return
          setStatus('error')
          term.write('\r\n\x1b[1;31m❌ WebSocket error\x1b[0m\r\n')
          console.error('WebSocket error:', error)
        }

        term.onData((data) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(data)
          }
        })

        term.onResize(({ cols, rows }) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'resize', cols, rows }))
          }
        })

        const handleResize = () => {
          fitAddon.fit()
        }
        resizeHandlerRef.current = handleResize
        window.addEventListener('resize', handleResize)

      } catch (error) {
        console.error('Failed to initialize terminal:', error)
        setStatus('error')
        setErrorMessage(String(error))
        if (termRef.current) {
          termRef.current.write(`\r\n\x1b[1;31m❌ Error: ${error}\x1b[0m\r\n`)
        }
      }
    }

    initTerminal()

    return () => {
      isMounted = false
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (termRef.current) {
        termRef.current.dispose()
      }
    }
  }, [mounted])

  const reconnect = () => {
    window.location.reload()
  }

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
          {status === 'creating-pty' && 'Creating PTY...'}
          {status === 'connecting' && 'Connecting...'}
          {status === 'connected' && 'Connected'}
          {status === 'disconnected' && 'Disconnected'}
          {status === 'error' && 'Error'}
        </div>
        {(status === 'disconnected' || status === 'error') && (
          <button style={styles.reconnectButton} onClick={reconnect}>
            Reconnect
          </button>
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
        <h3 style={styles.helpTitle}>Keyboard Shortcuts</h3>
        <div style={styles.helpGrid}>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Ctrl + C</kbd>
            <span style={styles.helpDesc}>Interrupt</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Ctrl + D</kbd>
            <span style={styles.helpDesc}>Exit</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Ctrl + L</kbd>
            <span style={styles.helpDesc}>Clear</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>↑ / ↓</kbd>
            <span style={styles.helpDesc}>History</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Tab</kbd>
            <span style={styles.helpDesc}>Autocomplete</span>
          </div>
          <div style={styles.helpItem}>
            <kbd style={styles.kbd}>Ctrl + R</kbd>
            <span style={styles.helpDesc}>Search</span>
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
  backgroundColor: status === 'connected' ? 'rgba(52, 199, 89, 0.15)' 
                   : status === 'connecting' || status === 'creating-pty' || status === 'initializing' ? 'rgba(255, 149, 0, 0.15)'
                   : status === 'error' ? 'rgba(255, 69, 58, 0.15)'
                   : 'rgba(0, 122, 255, 0.15)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: status === 'connected' ? '#34C759' 
         : status === 'connecting' || status === 'creating-pty' || status === 'initializing' ? '#FF9500'
         : status === 'error' ? '#FF453A'
         : '#007AFF',
})

const getStatusDotStyle = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: status === 'connected' ? '#34C759' 
                   : status === 'connecting' || status === 'creating-pty' || status === 'initializing' ? '#FF9500'
                   : status === 'error' ? '#FF453A'
                   : '#007AFF',
  animation: (status === 'connecting' || status === 'creating-pty' || status === 'initializing') ? 'pulse 1.5s ease-in-out infinite' : 'none',
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
  reconnectButton: {
    padding: '6px 16px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
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
    marginBottom: '40px',
  },
  terminalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
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
    fontSize: '14px',
    color: '#86868B',
  },
  terminalContainer: {
    padding: '16px',
    minHeight: '500px',
    maxHeight: '70vh',
    overflow: 'auto',
    backgroundColor: '#000000',
  },
  helpSection: {
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  helpTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#F5F5F7',
  },
  helpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  helpItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  kbd: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '13px',
    color: '#F5F5F7',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  helpDesc: {
    fontSize: '14px',
    color: '#86868B',
  },
}
