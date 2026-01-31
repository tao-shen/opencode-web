'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Status badge styles
const getStatusBadgeStyle = (isConnected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  backgroundColor: isConnected ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 69, 58, 0.15)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  color: isConnected ? '#34C759' : '#FF453A',
})

const getStatusDotStyle = (isConnected: boolean): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: isConnected ? '#34C759' : '#FF453A',
})

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/proxy/global/health')
      .then(res => res.ok)
      .then(setIsConnected)
      .catch(() => setIsConnected(false))
      .finally(() => setChecking(false))
  }, [])

  const serverUrl = 'http://170.9.12.37:4096'

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
          <div style={styles.navLinks}>
            <Link href="/docs" style={styles.navLink}>API Documentation</Link>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" style={styles.navLink}>GitHub</a>
          </div>
        </div>
        <div style={styles.navRight}>
          <div style={getStatusBadgeStyle(isConnected)}>
            <span style={getStatusDotStyle(isConnected)}></span>
            {checking ? 'Checking...' : isConnected ? 'Connected' : 'Offline'}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroBadge}>AI-Powered Coding Platform</div>
          <h1 style={styles.heroTitle}>
            Build faster with <br />
            <span style={styles.heroGradient}>OpenCode</span>
          </h1>
          <p style={styles.heroSubtitle}>
            A powerful AI-assisted coding platform with full terminal interface,
            extensive tool support, and seamless integration with your workflow.
          </p>

          {/* Three Main Actions */}
          <div style={styles.actionCards}>
            {/* Card 1: OpenCode Web */}
            <a href={serverUrl} target="_blank" rel="noopener noreferrer" style={styles.actionCard}>
              <div style={styles.actionIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 style={styles.actionTitle}>OpenCode Web</h3>
              <p style={styles.actionDesc}>
                Full-featured web interface. Manage sessions, browse files, and interact with AI.
              </p>
              <div style={styles.actionLink}>
                <span>Open in browser</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </a>

            {/* Card 2: Terminal */}
            <a href={serverUrl} target="_blank" rel="noopener noreferrer" style={styles.actionCard}>
              <div style={styles.actionIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.5">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </div>
              <h3 style={styles.actionTitle}>Terminal</h3>
              <p style={styles.actionDesc}>
                Interactive TUI terminal. Full command-line experience with AI assistance.
              </p>
              <div style={styles.actionLink}>
                <span>Launch terminal</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </a>

            {/* Card 3: API */}
            <Link href="/docs" style={styles.actionCard}>
              <div style={styles.actionIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 style={styles.actionTitle}>API</h3>
              <p style={styles.actionDesc}>
                Complete REST API reference. Type-safe SDK for JavaScript/TypeScript.
              </p>
              <div style={styles.actionLink}>
                <span>View documentation</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>TUI Terminal</h4>
            <p style={styles.featureDesc}>Full terminal interface with keyboard shortcuts and persistent sessions.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>Web Interface</h4>
            <p style={styles.featureDesc}>Access from any browser with responsive design and session management.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>Type-Safe SDK</h4>
            <p style={styles.featureDesc}>Official JavaScript/TypeScript SDK for programmatic control.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>Extensible Tools</h4>
            <p style={styles.featureDesc}>Read, write, edit, search, and execute shell commands.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>Secure</h4>
            <p style={styles.featureDesc}>Local-first design with optional authentication and encryption.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2 2 4-4" />
              </svg>
            </div>
            <h4 style={styles.featureTitle}>Open Source</h4>
            <p style={styles.featureDesc}>Free and open source. Contribute on GitHub.</p>
          </div>
        </section>

        {/* Quick Start */}
        <section style={styles.quickStart}>
          <h2 style={styles.sectionTitle}>Quick Start</h2>
          <p style={styles.sectionSubtitle}>Install the SDK and start building</p>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>npm</span>
              <button style={styles.copyButton} onClick={() => navigator.clipboard.writeText('npm install @opencode-ai/sdk')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <pre style={styles.codeContent}>
              <code>{`npm install @opencode-ai/sdk`}</code>
            </pre>
          </div>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>JavaScript</span>
            </div>
            <pre style={styles.codeContent}>
              <code>{`import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()

// Create a session
const session = await client.session.create({
  body: { title: "My Session" }
})

// Send a prompt
await client.session.prompt({
  path: { id: session.id },
  body: { message: "Hello, help me write code!" }
})`}</code>
            </pre>
          </div>
        </section>

        {/* Resources */}
        <section style={styles.resources}>
          <h2 style={styles.sectionTitle}>Resources</h2>
          <div style={styles.resourceGrid}>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>📦</div>
              <h4 style={styles.resourceTitle}>GitHub</h4>
              <p style={styles.resourceDesc}>Star us on GitHub</p>
            </a>
            <a href="https://opencode.ai/discord" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>💬</div>
              <h4 style={styles.resourceTitle}>Discord</h4>
              <p style={styles.resourceDesc}>Join our community</p>
            </a>
            <a href="https://opencode.ai/docs/cli" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>⌨️</div>
              <h4 style={styles.resourceTitle}>CLI Reference</h4>
              <p style={styles.resourceDesc}>All CLI commands</p>
            </a>
            <a href="https://opencode.ai/docs/tui" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>📖</div>
              <h4 style={styles.resourceTitle}>TUI Guide</h4>
              <p style={styles.resourceDesc}>Terminal interface guide</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>OpenCode - AI-Powered Coding Platform</p>
          <p style={styles.footerSubtext}>
            Server: {serverUrl} • Status: {isConnected ? '🟢 Connected' : '🔴 Offline'}
          </p>
        </div>
      </footer>
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
    gap: '40px',
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
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    color: '#86868B',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  main: {
    paddingTop: '64px',
  },
  hero: {
    padding: '100px 40px 80px',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#007AFF',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '64px',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 50%, #AF52DE 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '20px',
    lineHeight: 1.5,
    color: '#86868B',
    maxWidth: '600px',
    margin: '0 auto 48px',
  },
  actionCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '80px',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  actionIcon: {
    width: '72px',
    height: '72px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  actionTitle: {
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#F5F5F7',
  },
  actionDesc: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#86868B',
    marginBottom: '20px',
    textAlign: 'center',
  },
  actionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#007AFF',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    padding: '0 40px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#F5F5F7',
  },
  featureDesc: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#86868B',
  },
  quickStart: {
    padding: '60px 40px 80px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '17px',
    color: '#86868B',
    textAlign: 'center',
    marginBottom: '40px',
  },
  codeBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  codeLanguage: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#86868B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#86868B',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  codeContent: {
    padding: '20px',
    margin: 0,
    fontSize: '14px',
    fontFamily: 'SF Mono, Monaco, "Cascadia Code", monospace',
    lineHeight: 1.6,
    color: '#F5F5F7',
    overflow: 'auto',
  },
  resources: {
    padding: '0 40px 100px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  resourceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  resourceIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  resourceTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '4px',
  },
  resourceDesc: {
    fontSize: '13px',
    color: '#86868B',
  },
  footer: {
    padding: '40px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '8px',
  },
  footerSubtext: {
    fontSize: '13px',
    color: '#86868B',
  },
}
