'use client'

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
    gap: '16px',
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #334155',
  },
  endpoint: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #334155',
  },
  method: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    marginRight: '12px',
    textTransform: 'uppercase',
  },
  get: { backgroundColor: '#22c55e20', color: '#22c55e' },
  post: { backgroundColor: '#3b82f620', color: '#3b82f6' },
  delete: { backgroundColor: '#ef444420', color: '#ef4444' },
  path: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#e2e8f0',
  },
  code: {
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '13px',
    overflow: 'auto',
    marginTop: '12px',
    lineHeight: 1.5,
  },
  nav: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  navLink: {
    padding: '8px 16px',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  th: { textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' },
  td: { padding: '8px', borderBottom: '1px solid #334155' },
}

export default function DocsPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={{ textDecoration: 'none', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span style={{ fontWeight: 600 }}>OpenCode</span>
        </Link>
        <span style={{ color: '#64748b' }}>/</span>
        <span style={{ fontWeight: 600 }}>API Documentation</span>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>API Documentation</h1>

        <div style={styles.nav}>
          <a href="#sessions" style={{ ...styles.navLink, ...styles.navLinkActive }}>Sessions</a>
          <a href="#global" style={styles.navLink}>Global</a>
          <a href="#config" style={styles.navLink}>Config</a>
          <a href="#sse" style={styles.navLink}>SSE</a>
          <a href="#examples" style={styles.navLink}>Examples</a>
        </div>

        {/* Sessions */}
        <section id="sessions" style={styles.section}>
          <h2 style={styles.sectionTitle}>Sessions</h2>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.post }}>POST</span>
              <span style={styles.path}>/api/session</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Create a new session</p>
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
            <div>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/api/session?projectID=default&amp;limit=20</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>List all sessions</p>
          </div>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/api/session/:id</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Get session details</p>
          </div>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.post }}>POST</span>
              <span style={styles.path}>/api/session/:id/prompt</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Submit a prompt to a session</p>
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

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.post }}>POST</span>
              <span style={styles.path}>/api/session/:id/abort</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Abort a running session</p>
          </div>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.delete }}>DELETE</span>
              <span style={styles.path}>/api/session/:id</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Delete a session</p>
          </div>
        </section>

        {/* Global */}
        <section id="global" style={styles.section}>
          <h2 style={styles.sectionTitle}>Global</h2>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/api/global/health</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Health check - returns {`{"healthy":true,"version":"1.1.48"}`}</p>
          </div>
        </section>

        {/* SSE */}
        <section id="sse" style={styles.section}>
          <h2 style={styles.sectionTitle}>Server-Sent Events (SSE)</h2>

          <div style={styles.endpoint}>
            <div>
              <span style={{ ...styles.method, ...styles.get }}>GET</span>
              <span style={styles.path}>/api/sse/session/:id</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Subscribe to session events</p>
          </div>
        </section>

        {/* Examples */}
        <section id="examples" style={styles.section}>
          <h2 style={styles.sectionTitle}>cURL Examples</h2>

          <pre style={styles.code}>
{`# Create a session
curl -X POST http://localhost:3000/api/session \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Session"}'

# Submit a prompt
curl -X POST http://localhost:3000/api/session/:id/prompt \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Hello!","model":{"providerID":"openai","modelID":"gpt-4o"}}'`}
          </pre>
        </section>

        {/* Tools */}
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
                <td style={styles.td}><code>read</code></td>
                <td style={styles.td}>Read file contents</td>
                <td style={styles.td}><code>read /path/to/file</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code>write</code></td>
                <td style={styles.td}>Write file contents</td>
                <td style={styles.td}><code>write /path/to/file &quot;content&quot;</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code>edit</code></td>
                <td style={styles.td}>Edit file</td>
                <td style={styles.td}><code>edit /path/file old new</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code>bash</code></td>
                <td style={styles.td}>Execute shell commands</td>
                <td style={styles.td}><code>bash ls -la</code></td>
              </tr>
              <tr>
                <td style={styles.td}><code>search</code></td>
                <td style={styles.td}>Search file contents</td>
                <td style={styles.td}><code>search pattern /path</code></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Resources */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Resources</h2>
          <ul style={{ color: '#94a3b8', lineHeight: 2 }}>
            <li><a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>OpenCode Official Repository</a></li>
            <li><a href="https://github.com/taoshen2000/opencode-web" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>This Project Repository</a></li>
          </ul>
        </section>
      </main>
    </div>
  )
}
