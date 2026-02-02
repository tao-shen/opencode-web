'use client'

import dynamic from 'next/dynamic'

const OpenCodeTUI = dynamic(() => import('../../components/OpenCodeTUI'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(250, 178, 131, 0.2)',
          borderTopColor: '#fab283',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#808080', fontSize: '14px', fontFamily: 'SF Mono, Monaco, monospace' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  ),
})

export default function TUIPage() {
  return (
    <div style={styles.container}>
      <OpenCodeTUI />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
}
