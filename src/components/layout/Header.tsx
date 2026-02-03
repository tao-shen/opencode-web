'use client';

import Link from 'next/link';
import { useSessionStore } from '@/stores/useSessionStore';
import { useUIStore } from '@/stores/useUIStore';

export default function Header() {
  const { currentSessionId, sessions } = useSessionStore();
  const { isSettingsDialogOpen, setSettingsDialogOpen, isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/openchamber" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" strokeWidth="2">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#007AFF" />
                  <stop offset="100%" stopColor="#5856D6" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M21 12H3" />
              <path d="M3 12h18" />
            </svg>
            <span style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#F5F5F7',
            }}>
              OpenChamber
            </span>
          </div>
        </Link>

        {currentSessionId && (
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#86868B',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#F5F5F7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#86868B';
            }}
          >
            Toggle Sidebar
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '14px', color: '#86868B' }}>
          {currentSessionId ? `Session: ${currentSessionId.slice(0, 8)}...` : 'No session'}
        </div>

        <button
          onClick={() => setSettingsDialogOpen(!isSettingsDialogOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            color: '#86868B',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6h6m-6 0v6" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 0l-2.5-4.33a1.65 1.65 0 0 0-.33-.01l-2.5 4.33a1.65 1.65 0 0 0 .33.01z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
