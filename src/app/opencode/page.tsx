'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const OpencodeSDKTerminal = dynamic(() => import('../../components/OpencodeSDKTerminal'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D1117',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0, 122, 255, 0.2)',
          borderTopColor: '#007AFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#86868B', fontSize: '14px' }}>Loading OpenCode SDK...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  ),
})

export default function OpencodePage() {
  return (
    <div style={styles.container}>
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
          <span style={styles.currentPage}>SDK Client</span>
        </div>
        <div style={styles.navRight}>
          <Link href="/terminal" style={styles.navLink}>PTY Terminal</Link>
          <Link href="/" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>OpenCode SDK Client</h1>
          <p style={styles.subtitle}>
            Chat interface powered by the OpenCode SDK. Connect to your OpenCode server and start coding with AI assistance.
          </p>
          <div style={styles.infoBanner}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Server Connection:</strong> This client connects to{' '}
              <code style={styles.code}>{process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'}</code>
              <br />
              Connected to remote OpenCode server via ClawCloud.
            </div>
          </div>
        </div>

        <OpencodeSDKTerminal />

        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>Getting Started</h3>
          <div style={styles.helpGrid}>
            <div style={styles.helpCard}>
              <div style={styles.helpNumber}>1</div>
              <h4 style={styles.helpCardTitle}>Start Server</h4>
              <p style={styles.helpCardDesc}>
                Run the OpenCode server on your machine:
              </p>
              <code style={styles.codeBlock}>./scripts/start-opencode-server.sh</code>
            </div>

            <div style={styles.helpCard}>
              <div style={styles.helpNumber}>2</div>
              <h4 style={styles.helpCardTitle}>Create Session</h4>
              <p style={styles.helpCardDesc}>
                Click &quot;New Session&quot; to start a conversation with OpenCode AI.
              </p>
            </div>

            <div style={styles.helpCard}>
              <div style={styles.helpNumber}>3</div>
              <h4 style={styles.helpCardTitle}>Start Coding</h4>
              <p style={styles.helpCardDesc}>
                Type your questions or coding tasks and get AI-powered assistance.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.apiInfo}>
          <h3 style={styles.apiTitle}>API Reference</h3>
          <p style={styles.apiDesc}>
            This interface uses the OpenCode SDK to communicate with the server. The SDK provides:
          </p>
          <ul style={styles.apiList}>
            <li>Session management (create, list, delete)</li>
            <li>Message handling with streaming support</li>
            <li>TUI control (append prompt, submit, show toast)</li>
            <li>Full TypeScript support with type safety</li>
          </ul>
          <Link href="/docs" style={styles.apiLink}>
            View Full API Documentation →
          </Link>
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
  navLink: {
    color: '#86868B',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '80px 40px 40px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 700,
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '16px',
    color: '#86868B',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  infoBanner: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    border: '1px solid rgba(0, 122, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#F5F5F7',
    alignItems: 'flex-start',
  },
  code: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '13px',
    color: '#007AFF',
  },
  helpSection: {
    marginTop: '40px',
    padding: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  helpTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '24px',
    color: '#F5F5F7',
  },
  helpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  helpCard: {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  helpNumber: {
    width: '32px',
    height: '32px',
    backgroundColor: '#007AFF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  helpCardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#F5F5F7',
  },
  helpCardDesc: {
    fontSize: '14px',
    color: '#86868B',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  codeBlock: {
    display: 'block',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '8px 12px',
    borderRadius: '6px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '12px',
    color: '#50FA7B',
    overflow: 'auto',
  },
  apiInfo: {
    marginTop: '40px',
    padding: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  apiTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '12px',
    color: '#F5F5F7',
  },
  apiDesc: {
    fontSize: '14px',
    color: '#86868B',
    lineHeight: 1.6,
    marginBottom: '16px',
  },
  apiList: {
    fontSize: '14px',
    color: '#86868B',
    lineHeight: 1.8,
    marginBottom: '20px',
    paddingLeft: '20px',
  },
  apiLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#007AFF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
}
