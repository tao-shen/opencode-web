'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Status badge styles (outside styles object to avoid TypeScript errors)
const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  backgroundColor: status === 'connected' ? 'rgba(52, 199, 89, 0.15)' 
                   : status === 'connecting' ? 'rgba(255, 149, 0, 0.15)'
                   : status === 'error' ? 'rgba(255, 69, 58, 0.15)'
                   : 'rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: status === 'connected' ? '#34C759' 
         : status === 'connecting' ? '#FF9500'
         : status === 'error' ? '#FF453A'
         : '#86868B',
})

const getStatusDotStyle = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: status === 'connected' ? '#34C759' 
                   : status === 'connecting' ? '#FF9500'
                   : status === 'error' ? '#FF453A'
                   : '#86868B',
})

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('connecting')
  const [xtermLoaded, setXtermLoaded] = useState(false)
  const termRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Dynamically import xterm.js
    const loadXterm = async () => {
      try {
        const xtermStyles = document.createElement('link')
        xtermStyles.rel = 'stylesheet'
        xtermStyles.href = 'https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css'
        document.head.appendChild(xtermStyles)

        const xtermScript = document.createElement('script')
        xtermScript.src = 'https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js'
        xtermScript.onload = () => {
          setXtermLoaded(true)
          initTerminal()
        }
        document.body.appendChild(xtermScript)

        const xtermFitScript = document.createElement('script')
        xtermFitScript.src = 'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js'
        xtermFitScript.onload = () => {
          console.log('xterm-fit loaded')
        }
        document.body.appendChild(xtermFitScript)
      } catch (err) {
        console.error('Failed to load xterm.js:', err)
        setStatus('error')
      }
    }

    loadXterm()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (termRef.current) {
        termRef.current.dispose()
      }
    }
  }, [])

  const initTerminal = () => {
    if (!terminalRef.current || !(window as any).Terminal) {
      console.error('xterm not loaded')
      return
    }

    const serverUrl = 'http://170.9.12.37:4096'
    const wsUrl = serverUrl.replace('http', 'ws') + '/pty/connect'

    // Create xterm instance
    const term = new (window as any).Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: {
        background: '#000000',
        foreground: '#00FF00',
        cursor: '#00FF00',
        selectionBackground: '#333333',
        black: '#000000',
        red: '#FF5555',
        green: '#00FF00',
        yellow: '#FFFF55',
        blue: '#5555FF',
        magenta: '#FF55FF',
        cyan: '#55FFFF',
        white: '#AAAAAA',
        brightBlack: '#555555',
        brightRed: '#FF8888',
        brightGreen: '#88FF88',
        brightYellow: '#FFFF88',
        brightBlue: '#8888FF',
        brightMagenta: '#FF88FF',
        brightCyan: '#88FFFF',
        brightWhite: '#FFFFFF',
      },
      allowTransparency: true,
      scrollback: 1000,
    })

    term.open(terminalRef.current)
    termRef.current = term

    // Initial welcome message
    term.write('\r\n\x1b[1;32m🚀 Connecting to OpenCode...\x1b[0m\r\n')

    // Connect to WebSocket
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        term.write('\r\n\x1b[1;32m✅ Connected! Starting OpenCode...\x1b[0m\r\n\r\n')

        // Send command to start opencode
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'input',
            data: 'opencode\r\n'
          }))
        }, 500)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'output' && msg.data) {
            term.write(msg.data)
          }
        } catch (e) {
          // Handle raw output
          term.write(event.data)
        }
      }

      ws.onclose = () => {
        setStatus('disconnected')
        term.write('\r\n\x1b[1;31m❌ Disconnected from server\x1b[0m\r\n')
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        setStatus('error')
        term.write('\r\n\x1b[1;31m❌ Connection error\x1b[0m\r\n')
      }

      // Handle terminal input
      term.onData((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'input',
            data: data
          }))
        }
      })

      // Fit terminal to container
      setTimeout(() => {
        try {
          const fitAddon = (window as any).Terminal?.Addon?.Fit
          if (fitAddon && term.element) {
            const fit = new fitAddon()
            fit.attach(term)
            fit.fit()
          }
        } catch (e) {
          console.log('Fit addon not available, using default sizing')
        }
      }, 100)

    } catch (err) {
      console.error('Failed to connect:', err)
      setStatus('error')
      term.write('\r\n\x1b[1;31m❌ Failed to connect to server\x1b[0m\r\n')
    }
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
            {status === 'disconnected' && 'Disconnected'}
            {status === 'error' && 'Error'}
          </div>
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
            style={styles.terminalContainer}
          />
        </div>

        {/* Help Text */}
        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>Terminal Controls</h3>
          <div style={styles.helpGrid}>
            <div style={styles.helpItem}>
              <kbd style={styles.kbd}>Ctrl + C</kbd>
              <span style={styles.helpDesc}>Interrupt current command</span>
            </div>
            <div style={styles.helpItem}>
              <kbd style={styles.kbd}>Ctrl + D</kbd>
              <span style={styles.helpDesc}>Exit OpenCode</span>
            </div>
            <div style={styles.helpItem}>
              <kbd style={styles.kbd}>Ctrl + L</kbd>
              <span style={styles.helpDesc}>Clear screen</span>
            </div>
            <div style={styles.helpItem}>
              <kbd style={styles.kbd}>↑ / ↓</kbd>
              <span style={styles.helpDesc}>Command history</span>
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
    maxHeight: '600px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
