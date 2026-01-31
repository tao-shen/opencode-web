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
          Complete REST API reference for OpenCode. Use the official SDK for type-safe integration.
        </p>

        {/* Navigation Pills */}
        <div style={styles.pillNav}>
          <a href="#sdk" style={{ ...styles.pill, ...styles.pillActive }}>SDK</a>
          <a href="#global" style={styles.pill}>Global</a>
          <a href="#sessions" style={styles.pill}>Sessions</a>
          <a href="#files" style={styles.pill}>Files</a>
          <a href="#tui" style={styles.pill}>TUI</a>
          <a href="#config" style={styles.pill}>Config</a>
          <a href="#events" style={styles.pill}>Events</a>
        </div>

        {/* SDK Installation */}
        <section id="sdk" style={styles.section}>
          <h2 style={styles.sectionTitle}>SDK Installation</h2>
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

const { client } = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
})

const session = await client.session.create({
  body: { title: "My Session" }
})`}</code>
            </pre>
          </div>
        </section>

        {/* Global API */}
        <section id="global" style={styles.section}>
          <h2 style={styles.sectionTitle}>Global API</h2>
          <p style={styles.sectionDesc}>Global endpoints for health checks and app management</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Response</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/global/health</code></td>
                  <td style={styles.td}>Check server health and version</td>
                  <td style={styles.td}><code style={styles.codeInline}>{"{ healthy: true, version: string }"}</code></td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/app/log</code></td>
                  <td style={styles.td}>Write a log entry</td>
                  <td style={styles.td}><code style={styles.codeInline}>boolean</code></td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/app/agents</code></td>
                  <td style={styles.td}>List all available agents</td>
                  <td style={styles.td}><code style={styles.codeInline}>Agent[]</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sessions API */}
        <section id="sessions" style={styles.section}>
          <h2 style={styles.sectionTitle}>Sessions API</h2>
          <p style={styles.sectionDesc}>Create, manage, and interact with OpenCode sessions</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session</code></td>
                  <td style={styles.td}>List all sessions</td>
                  <td style={styles.td}>Returns Session[]</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session</code></td>
                  <td style={styles.td}>Create a new session</td>
                  <td style={styles.td}>Returns Session</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id</code></td>
                  <td style={styles.td}>Get session details</td>
                  <td style={styles.td}>Returns Session</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/prompt</code></td>
                  <td style={styles.td}>Send a prompt message</td>
                  <td style={styles.td}>Core session interaction</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/command</code></td>
                  <td style={styles.td}>Send a command to session</td>
                  <td style={styles.td}>Returns AssistantMessage</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/shell</code></td>
                  <td style={styles.td}>Run a shell command</td>
                  <td style={styles.td}>Returns AssistantMessage</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/abort</code></td>
                  <td style={styles.td}>Abort a running session</td>
                  <td style={styles.td}>Returns boolean</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/messages</code></td>
                  <td style={styles.td}>List messages in a session</td>
                  <td style={styles.td}>Returns Message[]</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/fork</code></td>
                  <td style={styles.td}>Fork a session</td>
                  <td style={styles.td}>Returns new Session</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/share</code></td>
                  <td style={styles.td}>Share session publicly</td>
                  <td style={styles.td}>Returns shared URL</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/unshare</code></td>
                  <td style={styles.td}>Unshare session</td>
                  <td style={styles.td}>Returns boolean</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/undo</code></td>
                  <td style={styles.td}>Undo last message</td>
                  <td style={styles.td}>Reverts file changes</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/redo</code></td>
                  <td style={styles.td}>Redo undone message</td>
                  <td style={styles.td}>Restores file changes</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id/init</code></td>
                  <td style={styles.td}>Analyze and create AGENTS.md</td>
                  <td style={styles.td}>Returns boolean</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodDelete}>DELETE</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/session/:id</code></td>
                  <td style={styles.td}>Delete a session</td>
                  <td style={styles.td}>Returns boolean</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Files API */}
        <section id="files" style={styles.section}>
          <h2 style={styles.sectionTitle}>Files API</h2>
          <p style={styles.sectionDesc}>Search, read, and manage files</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/find/text</code></td>
                  <td style={styles.td}>Search for text in files</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/find/files</code></td>
                  <td style={styles.td}>Find files by name</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/find/symbols</code></td>
                  <td style={styles.td}>Find workspace symbols</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/file/read</code></td>
                  <td style={styles.td}>Read file contents</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/file/status</code></td>
                  <td style={styles.td}>Get tracked file status</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/path</code></td>
                  <td style={styles.td}>Get current path info</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* TUI API */}
        <section id="tui" style={styles.section}>
          <h2 style={styles.sectionTitle}>TUI API</h2>
          <p style={styles.sectionDesc}>Control the terminal user interface programmatically</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/appendPrompt</code></td>
                  <td style={styles.td}>Append text to the prompt</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/submitPrompt</code></td>
                  <td style={styles.td}>Submit the current prompt</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/clearPrompt</code></td>
                  <td style={styles.td}>Clear the prompt</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/openHelp</code></td>
                  <td style={styles.td}>Open the help dialog</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/openSessions</code></td>
                  <td style={styles.td}>Open the session selector</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/openThemes</code></td>
                  <td style={styles.td}>Open the theme selector</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/openModels</code></td>
                  <td style={styles.td}>Open the model selector</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/executeCommand</code></td>
                  <td style={styles.td}>Execute a TUI command</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/tui/showToast</code></td>
                  <td style={styles.td}>Show toast notification</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Config API */}
        <section id="config" style={styles.section}>
          <h2 style={styles.sectionTitle}>Config API</h2>
          <p style={styles.sectionDesc}>Get configuration and provider information</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/config</code></td>
                  <td style={styles.td}>Get config info</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/config/providers</code></td>
                  <td style={styles.td}>List providers and defaults</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/project</code></td>
                  <td style={styles.td}>List all projects</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/project/current</code></td>
                  <td style={styles.td}>Get current project</td>
                </tr>
                <tr>
                  <td style={styles.td}><span style={styles.methodPost}>POST</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/auth/set</code></td>
                  <td style={styles.td}>Set authentication credentials</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Events API */}
        <section id="events" style={styles.section}>
          <h2 style={styles.sectionTitle}>Events API</h2>
          <p style={styles.sectionDesc}>Subscribe to real-time server-sent events</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><span style={styles.methodGet}>GET</span></td>
                  <td style={styles.td}><code style={styles.codeInline}>/sse/session/:id</code></td>
                  <td style={styles.td}>Subscribe to session events (SSE)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLanguage}>JavaScript - Subscribe to Events</span>
            </div>
            <pre style={styles.code}>
              <code>{`const events = await client.event.subscribe()

for await (const event of events.stream) {
  console.log("Event:", event.type, event.properties)
}`}</code>
            </pre>
          </div>

          <div style={styles.infoBox}>
            <strong>Event Types:</strong>
            <ul style={styles.infoList}>
              <li><code>session.created</code> - New session created</li>
              <li><code>session.status</code> - Session status changed</li>
              <li><code>message.created</code> - New message in session</li>
              <li><code>message.part.updated</code> - Message part updated</li>
              <li><code>tool.execute.before</code> - Tool execution started</li>
              <li><code>tool.execute.after</code> - Tool execution completed</li>
              <li><code>permission.asked</code> - Permission request</li>
            </ul>
          </div>
        </section>

        {/* Tools */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Available Tools</h2>
          <p style={styles.sectionDesc}>Built-in tools available in OpenCode sessions</p>

          <div style={styles.endpointTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tool</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Usage</th>
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
                <tr>
                  <td style={styles.td}><code style={styles.codeInline}>lsp</code></td>
                  <td style={styles.td}>LSP queries</td>
                  <td style={styles.td}><code style={styles.codeInline}>lsp &quot;query&quot;</code></td>
                </tr>
                <tr>
                  <td style={styles.td}><code style={styles.codeInline}>format</code></td>
                  <td style={styles.td}>Format code</td>
                  <td style={styles.td}><code style={styles.codeInline}>format /path/to/file</code></td>
                </tr>
              </tbody>
            </table>
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
            <a href="https://opencode.ai/docs/cli" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>⌨️</div>
              <h4 style={styles.resourceTitle}>CLI Reference</h4>
              <p style={styles.resourceDesc}>All CLI Commands</p>
            </a>
            <a href="https://opencode.ai/docs/tui" target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>🖥️</div>
              <h4 style={styles.resourceTitle}>TUI Guide</h4>
              <p style={styles.resourceDesc}>Terminal Interface</p>
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
    maxWidth: '1100px',
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
  },
  codeContent: {
    padding: '20px',
    margin: 0,
    fontSize: '14px',
    fontFamily: 'SF Mono, Monaco, monospace',
    lineHeight: 1.6,
    color: '#F5F5F7',
    overflow: 'auto',
  },
  codeInline: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    color: '#007AFF',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'SF Mono, Monaco, monospace',
  },
  endpointTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
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
    fontSize: '14px',
    verticalAlign: 'top',
  },
  methodGet: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    color: '#34C759',
    marginRight: '8px',
  },
  methodPost: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    color: '#007AFF',
    marginRight: '8px',
  },
  methodDelete: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    color: '#FF453A',
    marginRight: '8px',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
    border: '1px solid rgba(0, 122, 255, 0.2)',
  },
  infoList: {
    margin: '12px 0 0 0',
    paddingLeft: '20px',
    color: '#86868B',
    lineHeight: 1.8,
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
