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
            <Link href="/docs" style={styles.navLink}>Documentation</Link>
            <a href={serverUrl} target="_blank" rel="noopener noreferrer" style={styles.navLink}>Terminal</a>
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
          <div style={styles.heroButtons}>
            <a href={serverUrl} target="_blank" rel="noopener noreferrer" style={styles.primaryButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              Open Terminal
            </a>
            <Link href="/docs" style={styles.secondaryButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              API Documentation
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Terminal Interface</h3>
            <p style={styles.featureDesc}>
              Full-featured TUI with syntax highlighting, keyboard shortcuts, and persistent sessions.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Web Interface</h3>
            <p style={styles.featureDesc}>
              Access OpenCode from any browser with our responsive web application.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Type-Safe SDK</h3>
            <p style={styles.featureDesc}>
              Official JavaScript/TypeScript SDK for programmatic control and integrations.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Extensible Tools</h3>
            <p style={styles.featureDesc}>
              Read, write, edit, search, and execute shell commands with built-in tools.
            </p>
          </div>
        </section>

        {/* Quick API Examples */}
        <section style={styles.apiSection}>
          <h2 style={styles.sectionTitle}>Quick Start</h2>
          <p style={styles.sectionSubtitle}>Install the SDK and start building</p>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>JavaScript</span>
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
              <span style={styles.codeLanguage}>Create a Session</span>
            </div>
            <pre style={styles.codeContent}>
              <code>{`import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()

const session = await client.session.create({
  body: { title: "My Session" }
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
            <Link href="/docs" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>📚</div>
              <h4 style={styles.resourceTitle}>Documentation</h4>
              <p style={styles.resourceDesc}>Read the full docs</p>
            </Link>
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
    padding: '120px 40px 100px',
    textAlign: 'center',
    maxWidth: '900px',
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
    fontSize: '72px',
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
    fontSize: '21px',
    lineHeight: 1.5,
    color: '#86868B',
    maxWidth: '600px',
    margin: '0 auto 40px',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    borderRadius: '24px',
    fontSize: '17px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#F5F5F7',
    borderRadius: '24px',
    fontSize: '17px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    padding: '60px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '12px',
    color: '#F5F5F7',
  },
  featureDesc: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#86868B',
  },
  apiSection: {
    padding: '100px 40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '40px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '19px',
    color: '#86868B',
    textAlign: 'center',
    marginBottom: '48px',
  },
  codeBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  codeLanguage: {
    fontSize: '13px',
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
    padding: '60px 40px 100px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  resourceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  resourceIcon: {
    fontSize: '36px',
    marginBottom: '16px',
  },
  resourceTitle: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '6px',
  },
  resourceDesc: {
    fontSize: '14px',
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
