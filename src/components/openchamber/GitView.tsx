'use client';

import { useState } from 'react';

export default function GitView() {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  
  const changes = [
    { id: '1', file: 'src/app/openchamber/page.tsx', status: 'modified' },
    { id: '2', file: 'src/components/layout/Header.tsx', status: 'added' },
    { id: '3', file: 'src/stores/useSessionStore.ts', status: 'added' },
  ];

  const stats = {
    added: changes.filter((c) => c.status === 'added').length,
    modified: changes.filter((c) => c.status === 'modified').length,
    deleted: changes.filter((c) => c.status === 'deleted').length,
  };

  const handleCommit = () => {
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      setCommitMessage('');
    }, 1000);
  };

  return (
    <div style={{ height: '100%', padding: '40px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#F5F5F7' }}>
            Git Operations
          </h2>
          <p style={{ fontSize: '14px', color: '#86868B', marginBottom: '24px' }}>
            Manage your git repository, view changes, and create commits.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', padding: '16px', backgroundColor: 'rgba(52, 199, 89, 0.1)', borderRadius: '12px', border: '1px solid rgba(82, 82, 91, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#86868B', marginBottom: '8px' }}>Added</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#34C759' }}>{stats.added}</div>
            </div>
            <div style={{ flex: '1', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#86868B', marginBottom: '8px' }}>Modified</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#F59E0B' }}>{stats.modified}</div>
            </div>
            <div style={{ flex: '1', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#86868B', marginBottom: '8px' }}>Deleted</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#EF4444' }}>{stats.deleted}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F5F5F7' }}>
              Changes
            </h3>

            {changes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#86868B' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔀</div>
                <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No changes</div>
                <div style={{ fontSize: '14px' }}>
                  Working tree is clean. No files have been modified.
                </div>
              </div>
            ) : (
              changes.map((change) => (
                <div
                  key={change.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor:
                        change.status === 'added'
                          ? '#34C759'
                          : change.status === 'modified'
                            ? '#F59E0B'
                            : '#EF4444',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F7', marginBottom: '4px' }}>
                      {change.file}
                    </div>
                    <div style={{ fontSize: '12px', color: '#86868B' }}>
                      {change.status === 'added' && 'New file'}
                      {change.status === 'modified' && 'Modified'}
                      {change.status === 'deleted' && 'Deleted'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#F5F5F7' }}>
              Commit Message
            </label>
            <div style={{ flex: 1 }}>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe your changes..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#F5F5F7',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleCommit}
              disabled={isCommitting || !commitMessage.trim()}
              style={{
                background: isCommitting ? '#86868B' : '#007AFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isCommitting || !commitMessage.trim() ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isCommitting ? '⏳ Committing...' : 'Commit Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
