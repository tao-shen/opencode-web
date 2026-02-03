'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useUIStore } from '@/stores/useUIStore';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ChatView from '@/components/openchamber/ChatView';
import TerminalView from '@/components/openchamber/TerminalView';
import GitView from '@/components/openchamber/GitView';
import SettingsView from '@/components/openchamber/SettingsView';

export default function OpenChamberPage() {
  const { currentSessionId } = useSessionStore();
  const { activeMainTab, isSidebarOpen } = useUIStore();

  const renderMainContent = () => {
    switch (activeMainTab) {
      case 'chat':
        return <ChatView />;
      case 'terminal':
        return <TerminalView />;
      case 'git':
        return <GitView />;
      case 'settings':
        return <SettingsView />;
      case 'files':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 64px)',
              color: '#86868B',
              fontSize: '16px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
              Files View
            </div>
            <div style={{ color: '#86868B', maxWidth: '400px', textAlign: 'center' }}>
              This view is coming soon. Stay tuned for updates!
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#F5F5F7',
        fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      <Header />
      <div
        style={{
          display: 'flex',
          paddingTop: '64px',
        }}
      >
        {isSidebarOpen && <Sidebar />}
        <main
          style={{
            flex: 1,
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {!currentSessionId ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86868B',
                fontSize: '16px',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  maxWidth: '500px',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
                  No Session Selected
                </div>
                <div style={{ color: '#86868B', marginBottom: '24px' }}>
                  Create or select a session from the sidebar to start using OpenChamber.
                </div>
                <button
                  onClick={() => {
                    const sidebarButton = document.querySelector('aside button');
                    if (sidebarButton) {
                      sidebarButton.dispatchEvent(new Event('click'));
                    }
                  }}
                  style={{
                    background: '#007AFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Create New Session
                </button>
              </div>
            </div>
          ) : (
            renderMainContent()
          )}
        </main>
      </div>
    </div>
  );
}
