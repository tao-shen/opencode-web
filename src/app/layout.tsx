import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenCode Web',
  description: 'Web-based OpenCode interface for AI-assisted coding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
