'use client';

import { useSessionStore } from '@/stores/useSessionStore';
import { useUIStore } from '@/stores/useUIStore';

export default function Sidebar() {
  const { sessions, currentSessionId, setCurrentSession, deleteSession, createSession } = useSessionStore();
  const { activeMainTab, setActiveMainTab } = useUIStore();

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'terminal', label: 'Terminal', icon: '⌨️' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'git', label: 'Git', icon: '🔀' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <aside
      style={{
        width: '280px',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id as any)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px',
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: activeMainTab === tab.id ? '#007AFF' : '#86868B',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#86868B' }}>Sessions</h3>
          <button
            onClick={() => createSession({
              id: crypto.randomUUID(),
              slug: crypto.randomUUID().slice(0, 8),
              title: 'New Session',
              projectID: 'default',
              directory: '/tmp',
              version: '1.0.0',
              time: { created: Date.now(), updated: Date.now() },
              status: 'idle',
            })}
            style={{
              background: '#007AFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            + New
          </button>
        </div>

        {Array.from(sessions.values()).map((session) => (
          <div
            key={session.id}
            onClick={() => setCurrentSession(session.id)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor:
                currentSessionId === session.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
              border: currentSessionId === session.id ? '1px solid #007AFF' : 'none',
              marginBottom: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              if (currentSessionId !== session.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: session.status === 'running' ? '#50FA7B' : '#86868B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                {session.status === 'running' ? '⚡' : '💬'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#F5F5F7',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session.title}
                </div>
                <div style={{ fontSize: '12px', color: '#86868B', marginTop: '2px' }}>
                  {new Date(session.time.created).toLocaleString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete session "${session.title}"?`)) {
                    deleteSession(session.id);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#86868B',
                  cursor: 'pointer',
                  padding: '4px',
                  opacity: 0.6,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.color = '#FF453A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.color = '#86868B';
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
