'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 600,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #334155',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardDesc: {
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '16px',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'opacity 0.2s',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '24px',
    textAlign: 'center',
  },
  apiEndpoint: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '14px',
    marginBottom: '12px',
    overflowX: 'auto',
  },
  method: {
    color: '#22c55e',
    fontWeight: 600,
    marginRight: '12px',
  },
  endpoint: {
    color: '#e2e8f0',
  },
  code: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'monospace',
    fontSize: '14px',
    overflowX: 'auto',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    borderTop: '1px solid #334155',
    color: '#64748b',
    fontSize: '14px',
  },
}

export default function HomePage() {
  const [serverUrl, setServerUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // Get server URL from environment or URL parameter
    const params = new URLSearchParams(window.location.search)
    const server = params.get('server') || process.env.NEXT_PUBLIC_OPENCODE_URL || 'http://170.9.12.37:4096'
    setServerUrl(server)
    
    // Check connection
    if (server) {
      setChecking(true)
      fetch(`${server}/global/health`)
        .then(res => res.ok)
        .then(setIsConnected)
        .catch(() => setIsConnected(false))
        .finally(() => setChecking(false))
    }
  }, [])

  const openCodeUrl = serverUrl || 'http://170.9.12.37:4096'

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          OpenCode Gateway
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {checking && <span style={{ color: '#eab308' }}>Checking...</span>}
          {!checking && isConnected && (
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', backgroundColor: '#22c55e20', 
              borderRadius: '20px', color: '#22c55e', fontSize: '12px' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              Connected
            </span>
          )}
          {!checking && !isConnected && (
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', backgroundColor: '#ef444420', 
              borderRadius: '20px', color: '#ef4444', fontSize: '12px' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              Disconnected
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.title}>OpenCode API Gateway</h1>
          <p style={styles.subtitle}>
            Powerful AI-assisted coding platform with full API access. 
            Connect to your OpenCode server and integrate with any application.
          </p>
        </div>

        {/* Quick Links */}
        <div style={styles.grid}>
          {/* OpenCode Terminal */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              Terminal
            </h3>
            <p style={styles.cardDesc}>
              Use the full OpenCode terminal interface with TUI, tools, and AI assistance.
            </p>
            <a href={openCodeUrl} target="_blank" rel="noopener noreferrer" style={styles.btn}>
              Open Terminal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>

          {/* API Docs */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              API Documentation
            </h3>
            <p style={styles.cardDesc}>
              Complete API reference with examples in multiple languages.
            </p>
            <Link href="/docs" style={{ ...styles.btn, ...styles.btnSecondary }}>
              View API Docs
            </Link>
          </div>

          {/* SDK */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              SDK & Libraries
            </h3>
            <p style={styles.cardDesc}>
              Official SDKs for JavaScript, Python, and other languages.
            </p>
            <Link href="/docs#sdks" style={{ ...styles.btn, ...styles.btnSecondary }}>
              Get SDK
            </Link>
          </div>
        </div>

        {/* Quick API Examples */}
        <h2 style={styles.sectionTitle}>Quick API Examples</h2>
        <pre style={styles.code}>
{`// Create a session
POST ${openCodeUrl}/session
Content-Type: application/json

{"title": "My Session"}

// Submit a prompt
POST ${openCodeUrl}/session/:id/prompt
Content-Type: application/json

{
  "message": "Write a Python function to calculate fibonacci",
  "model": {"providerID": "openai", "modelID": "gpt-4o"}
}

// List sessions
GET ${openCodeUrl}/session

// Get real-time updates
GET ${openCodeUrl}/session/:id/event`}
        </pre>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>OpenCode Gateway | Powered by OpenCode</p>
        <p style={{ marginTop: '8px' }}>
          Server: {openCodeUrl} | Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}
        </p>
      </footer>
    </div>
  )
}
