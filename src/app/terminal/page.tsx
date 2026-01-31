'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Status badge styles
const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  backgroundColor: status === 'connected' ? 'rgba(52, 199, 89, 0.15)' 
                   : status === 'connecting' ? 'rgba(255, 149, 0, 0.15)'
                   : status === 'error' ? 'rgba(255, 69, 58, 0.15)'
                   : 'rgba(0, 122, 255, 0.15)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: status === 'connected' ? '#34C759' 
         : status === 'connecting' ? '#FF9500'
         : status === 'error' ? '#FF453A'
         : '#007AFF',
})

const getStatusDotStyle = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: status === 'connected' ? '#34C759' 
                   : status === 'connecting' ? '#FF9500'
                   : status === 'error' ? '#FF453A'
                   : '#007AFF',
})

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('initializing')
  const [terminalLoaded, setTerminalLoaded] = useState(false)
  const termRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Dynamically import xterm to avoid SSR issues
  useEffect(() => {
    let isMounted = true

    const initTerminal = async () => {
      if (!terminalRef.current || !isMounted) return

      try {
        // Dynamic import xterm.js
        const xtermModule = await import('@xterm/xterm')
        const attachAddonModule = await import('@xterm/addon-attach')
        const fitAddonModule = await import('@xterm/addon-fit')
        
        const { Terminal } = xtermModule
        const { AttachAddon } = attachAddonModule
        const { FitAddon } = fitAddonModule
        
        // Create terminal instance
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
        setTerminalLoaded(true)
        term.write('\r\n\x1b[1;34m🚀 Initializing OpenCode Terminal...\x1b[0m\r\n')

        // Connect via Cloudflare Tunnel (WSS over HTTPS)
        const wsUrl = `wss://craig-shake-gender-spoke.trycloudflare.com/pty/connect`
        
        setStatus('connecting')
        term.write(`\r\n\x1b[33mConnecting to ${wsUrl}...\x1b[0m\r\n`)

        try {
          const socket = new WebSocket(wsUrl)
          wsRef.current = socket

          socket.onopen = () => {
            if (!isMounted) return
            setStatus('connected')
            term.write('\r\n\x1b[1;32m✅ Connected to OpenCode!\x1b[0m\r\n\r\n')
            
            const attachAddon = new AttachAddon(socket, {
              bidirectional: true,
            })
            term.loadAddon(attachAddon)
            
            socket.send(JSON.stringify({
              type: 'resize',
              cols: term.cols,
              rows: term.rows
            }))
            
            term.write('\x1b[1;36mWelcome to OpenCode!\x1b[0m\r\n')
            term.write('Type \x1b[1;33m/help\x1b[0m for available commands.\r\n\r\n')
            term.focus()
          }

          socket.onmessage = (event) => {
            if (!isMounted) return
            try {
              const msg = JSON.parse(event.data)
              if (msg.type === 'output' && msg.data) {
                term.write(msg.data)
              }
            } catch {
              term.write(event.data)
            }
          }

          socket.onclose = (event) => {
            if (!isMounted) return
            setStatus('disconnected')
            term.write(`\r\n\x1b[1;31m❌ Connection closed (code: ${event.code})\x1b[0m\r\n`)
            term.write('\r\n\x1b[33mTo reconnect, refresh the page or click "Reconnect"\x1b[0m\r\n')
          }

          socket.onerror = (error) => {
            if (!isMounted) return
            setStatus('error')
            term.write('\r\n\x1b[1;31m❌ WebSocket error\x1b[0m\r\n')
            console.error('WebSocket error:', error)
          }

          term.onResize(({ cols, rows }) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'resize', cols, rows }))
            }
          })

          // Handle browser resize
          const handleResize = () => {
            fitAddon.fit()
          }
          window.addEventListener('resize', handleResize)

        } catch (error) {
          if (!isMounted) return
          setStatus('error')
          term.write(`\r\n\x1b[1;31m❌ Failed to connect: ${error}\x1b[0m\r\n`)
        }
      } catch (error) {
        console.error('Failed to load xterm:', error)
        setStatus('error')
      }
    }

    initTerminal()

    return () => {
      isMounted = false
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (termRef.current) {
        termRef.current.dispose()
      }
    }
  }, [])

  const reconnect = () => {
    window.location.reload()
  }

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link href="/" style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.5">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#007AFF" />
                  <stop offset="100%" stopColor="#5856D6" />
                </linearGradient>
              </defs>
              <rect x="2" y="3" width="20" height="14" rx="3" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span style={styles.logoText}>OpenCode</span>
          </Link>
          <span style={styles.breadcrumb}>/</span>
          <span style={styles.currentPage}>Terminal</span>
        </div>
        <div style={styles.navRight}>
          <Link href="/" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div style={getStatusBadgeStyle(status)}>
            <span style={getStatusDotStyle(status)}></span>
            {status === 'connecting' && 'Connecting...'}
            {status === 'connected' && 'Connected'}
            {status === 'disconnected' && 'Reconnect'}
            {status === 'error' && 'Error'}
            {status === 'initializing' && 'Initializing...'}
          </div>
          {(status === 'disconnected' || status === 'error') && (
            <button style={styles.reconnectButton} onClick={reconnect}>
              Reconnect
            </button>
          )}
        </div>
      </nav>

      {/* Terminal Container */}
      <main style={styles.main}>
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
            suppressHydrationWarning
            style={styles.terminalContainer}
          />
        </div>

        {/* Help Section */}
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
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#F5F5F7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    zIndex: 1000,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#F5F5F7',
  },
  breadcrumb: {
    color: '#86868B',
  },
  currentPage: {
    color: '#F5F5F7',
    fontWeight: 500,
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#86868B',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
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
  main: {
    paddingTop: '64px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
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
