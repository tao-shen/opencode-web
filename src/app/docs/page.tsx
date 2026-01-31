'use client'

import Link from 'next/link'

export default function DocsPage() {
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
          <span style={styles.breadcrumb}>/</span>
          <span style={styles.currentPage}>API Documentation</span>
        </div>
        <div style={styles.navRight}>
          <Link href="/" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.title}>API Documentation</h1>
        <p style={styles.subtitle}>
          Complete reference for the OpenCode API. Use the SDK for type-safe integration.
        </p>

        {/* Navigation Pills */}
        <div style={styles.pillNav}>
          <a href="#sessions" style={{ ...styles.pill, ...styles.pillActive }}>Sessions</a>
          <a href="#global" style={styles.pill}>Global</a>
          <a href="#sdk" style={styles.pill}>SDK</a>
          <a href="#tools" style={styles.pill}>Tools</a>
          <a href="#examples" style={styles.pill}>Examples</a>
        </div>

        {/* Sessions Section */}
        <section id="sessions" style={styles.section}>
          <h2 style={styles.sectionTitle}>Sessions</h2>
          <p style={styles.sectionDesc}>Create and manage OpenCode sessions</p>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={{ ...styles.method, ...styles.post }}>POST</span>
              <span style={styles.path}>/session</span>
            </div>
            <p style={styles.endpointDesc}>Create a new session</p>
            <pre style={styles.code}>
{`{
  "title": "My Session",
  "directory": "/path/to/project",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-4o"
  }
}`}
            </pre>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/session?projectID=default&amp;limit=20</span>
            </div>
            <p style={styles.endpointDesc}>List all sessions</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={{ ...styles.method, ...styles.post }}>POST</span>
              <span style={styles.path}>/session/:id/prompt</span>
            </div>
            <p style={styles.endpointDesc}>Send a prompt to a session</p>
            <pre style={styles.code}>
{`{
  "message": "Write a Python function",
  "agent": "general",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-4o"
  }
}`}
            </pre>
          </div>
        </section>

        {/* Global Section */}
        <section id="global" style={styles.section}>
          <h2 style={styles.sectionTitle}>Global</h2>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/global/health</span>
            </div>
            <p style={styles.endpointDesc}>Health check endpoint</p>
            <pre style={styles.code}>
{`// Response
{
  "healthy": true,
  "version": "1.1.48"
}`}
            </pre>
          </div>
        </section>

        {/* SDK Section */}
        <section id="sdk" style={styles.section}>
          <h2 style={styles.sectionTitle}>SDK</h2>
          <p style={styles.sectionDesc}>Install the official JavaScript/TypeScript SDK</p>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>npm</span>
            </div>
            <pre style={styles.code}>
              <code>{`npm install @opencode-ai/sdk`}</code>
            </pre>
          </div>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>JavaScript</span>
            </div>
            <pre style={styles.code}>
              <code>{`import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()

// Create a session
const session = await client.session.create({
  body: { title: "My Session" }
})`}</code>
            </pre>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" style={styles.section}>
          <h2 style={styles.sectionTitle}>Available Tools</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tool</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><code style={styles.codeInline}>read</code></td>
                <td style={styles.td}>Read file contents</td>
                <td style={styles.td}><code style={styles.codeInline}>read /path/to/file</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code style={styles.codeInline}>write</code></td>
                <td style={styles.td}>Write file contents</td>
                <td style={styles.td}><code style={styles.codeInline}>write /path/file &quot;content&quot;</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code style={styles.codeInline}>edit</code></td>
                <td style={styles.td}>Edit file</td>
                <td style={styles.td}><code style={styles.codeInline}>edit /path/file old new</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code style={styles.codeInline}>bash</code></td>
                <td style={styles.td}>Execute shell commands</td>
                <td style={styles.td}><code style={styles.codeInline}>bash ls -la</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code style={styles.codeInline}>search</code></td>
                <td style={styles.td}>Search file contents</td>
                <td style={styles.td}><code style={styles.codeInline}>search pattern /path</code></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Examples Section */}
        <section id="examples" style={styles.section}>
          <h2 style={styles.sectionTitle}>cURL Examples</h2>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>bash</span>
            </div>
            <pre style={styles.code}>
              <code>{`# Create a session
curl -X POST ${serverUrl}/session \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Session"}'

# Send a prompt
curl -X POST ${serverUrl}/session/:id/prompt \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Hello!","model":{"providerID":"openai","modelID":"gpt-4o"}}'`}</code>
            </pre>
          </div>
        </section>

        {/* Resources */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Resources</h2>
          <div style={styles.resourceGrid}>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>📦</div>
              <h4 style={styles.resourceTitle}>GitHub</h4>
              <p style={styles.resourceDesc}>OpenCode Repository</p>
            </a>
            <a href="https://opencode.ai/docs/sdk" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>📚</div>
              <h4 style={styles.resourceTitle}>Official SDK Docs</h4>
              <p style={styles.resourceDesc}>Full SDK Reference</p>
            </a>
            <a href="https://opencode.ai/discord" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>💬</div>
              <h4 style={styles.resourceTitle}>Discord</h4>
              <p style={styles.resourceDesc}>Community Support</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>OpenCode API Documentation</p>
        <p style={styles.footerSubtext}>Server: {serverUrl}</p>
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '80px 40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '19px',
    color: '#86868B',
    lineHeight: 1.6,
    marginBottom: '40px',
  },
  pillNav: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '48px',
  },
  pill: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    color: '#86868B',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    color: '#007AFF',
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  section: {
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#F5F5F7',
  },
  sectionDesc: {
    fontSize: '15px',
    color: '#86868B',
    marginBottom: '24px',
  },
  endpoint: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  endpointHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  method: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    marginRight: '12px',
    textTransform: 'uppercase',
  },
  post: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    color: '#007AFF',
  },
  get: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    color: '#34C759',
  },
  delete: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    color: '#FF453A',
  },
  path: {
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '14px',
    color: '#F5F5F7',
  },
  endpointDesc: {
    fontSize: '14px',
    color: '#86868B',
    marginBottom: '12px',
  },
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '16px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#F5F5F7',
    overflow: 'auto',
    margin: 0,
  },
  codeBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  codeLanguage: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#86868B',
    textTransform: 'uppercase',
  },
  codeInline: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    color: '#007AFF',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'SF Mono, Monaco, monospace',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '13px',
    fontWeight: 600,
    color: '#86868B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: '15px',
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
    transition: 'all 0.2s ease',
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
    textAlign: 'center',
  },
  footerText: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#F5F5F7',
    marginBottom: '6px',
  },
  footerSubtext: {
    fontSize: '13px',
    color: '#86868B',
  },
}
