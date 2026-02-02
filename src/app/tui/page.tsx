'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const OpenCodeTUI = dynamic(() => import('../../components/OpenCodeTUI'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D1117',
      borderRadius: '12px',
      border: '1px solid #30363D',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(88, 166, 255, 0.2)',
          borderTopColor: '#58A6FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#8B949E', fontSize: '14px' }}>Loading TUI...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  ),
})

export default function TUIPage() {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link href="/" style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.5">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#58A6FF" />
                  <stop offset="100%" stopColor="#BC8CFF" />
                </linearGradient>
              </defs>
              <rect x="2" y="3" width="20" height="14" rx="3" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span style={styles.logoText}>OpenCode</span>
          </Link>
          <span style={styles.breadcrumb}>/</span>
          <span style={styles.currentPage}>TUI</span>
        </div>
        <div style={styles.navRight}>
          <Link href="/terminal" style={styles.navLink}>
            Classic Terminal
          </Link>
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
          <h1 style={styles.title}>OpenCode TUI</h1>
          <p style={styles.subtitle}>
            Canvas-based terminal user interface inspired by{' '}
            <a href="https://github.com/anomalyco/opentui" target="_blank" rel="noopener noreferrer" style={styles.link}>
              OpenTUI
            </a>
          </p>
        </div>
        <OpenCodeTUI />
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
    gap: '24px',
  },
  navLink: {
    color: '#8B949E',
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '100px 40px 40px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #58A6FF, #BC8CFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8B949E',
  },
  link: {
    color: '#58A6FF',
    textDecoration: 'none',
  },
}
