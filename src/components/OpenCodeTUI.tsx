'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface MessagePart {
  type: string
  text?: string
  toolInvocation?: {
    toolName?: string
    state?: string
    args?: Record<string, unknown>
    result?: unknown
  }
}

// Server URL for direct SSE connection
const OPENCODE_SERVER = process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

// TUI Constants - match OpenTUI exactly
const CELL_W = 9
const CELL_H = 18
const FONT = '14px "SF Mono", Monaco, "Cascadia Code", Consolas, monospace'

// OpenCode Theme Colors (dark mode)
const THEME = {
  background: '#0a0a0a',
  backgroundPanel: '#141414',
  backgroundElement: '#1e1e1e',
  primary: '#fab283',       // Orange accent
  secondary: '#5c9cf5',     // Blue
  accent: '#9d7cd8',        // Purple
  text: '#eeeeee',
  textMuted: '#808080',
  border: '#484848',
  borderActive: '#606060',
  borderSubtle: '#3c3c3c',
  error: '#e06c75',
  warning: '#f5a742',
  success: '#7fd88f',
  info: '#56b6c2',
}

// Logo data from OpenCode - with shadow markers
const LOGO = {
  left: ["                   ", "█▀▀█ █▀▀█ █▀▀█ █▀▀▄", "█__█ █__█ █^^^ █__█", "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀"],
  right: ["             ▄     ", "█▀▀▀ █▀▀█ █▀▀█ █▀▀█", "█___ █__█ █__█ █^^^", "▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀"],
}

// Placeholders like OpenCode
const PLACEHOLDERS = [
  "Fix a TODO in the codebase",
  "What is the tech stack of this project?",
  "Fix broken tests",
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parts?: { type: string; text?: string; state?: string; toolName?: string }[]
  time: { created: number; completed?: number }
}

class TUIRenderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  cols: number = 0
  rows: number = 0
  dpr: number = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()

    const resizeObserver = new ResizeObserver(() => this.resize())
    resizeObserver.observe(canvas.parentElement!)
  }

  resize() {
    const parent = this.canvas.parentElement!
    this.dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()

    this.canvas.width = rect.width * this.dpr
    this.canvas.height = rect.height * this.dpr
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    this.cols = Math.floor(rect.width / CELL_W)
    this.rows = Math.floor(rect.height / CELL_H)
  }

  clear() {
    this.ctx.fillStyle = THEME.background
    this.ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr)
  }

  drawChar(char: string, x: number, y: number, fg: string, bg?: string) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return

    const px = x * CELL_W
    const py = y * CELL_H

    if (bg) {
      this.ctx.fillStyle = bg
      this.ctx.fillRect(px, py, CELL_W, CELL_H)
    }

    this.ctx.font = FONT
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = fg
    this.ctx.fillText(char, px + 1, py + 2)
  }

  drawText(text: string, x: number, y: number, fg: string, maxWidth?: number) {
    const max = maxWidth ?? (this.cols - x)
    for (let i = 0; i < Math.min(text.length, max); i++) {
      this.drawChar(text[i], x + i, y, fg)
    }
    return Math.min(text.length, max)
  }

  // Draw logo with shadow effects (matching OpenCode exactly)
  drawLogo(centerX: number, y: number) {
    const shadow = this.tintColor(THEME.background, THEME.textMuted, 0.25)

    const renderLine = (line: string, x: number, y: number, fg: string, bold: boolean) => {
      let cx = x
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '_') {
          // Full shadow cell
          this.drawChar(' ', cx, y, fg, shadow)
        } else if (char === '^') {
          // Letter top, shadow bottom
          this.drawChar('▀', cx, y, fg, shadow)
        } else if (char === '~') {
          // Shadow top only
          this.drawChar('▀', cx, y, shadow)
        } else {
          this.drawChar(char, cx, y, fg)
        }
        cx++
      }
    }

    const logoWidth = LOGO.left[0].length + 1 + LOGO.right[0].length
    const startX = centerX - Math.floor(logoWidth / 2)

    for (let i = 0; i < LOGO.left.length; i++) {
      renderLine(LOGO.left[i], startX, y + i, THEME.textMuted, false)
      renderLine(LOGO.right[i], startX + LOGO.left[i].length + 1, y + i, THEME.text, true)
    }

    return LOGO.left.length
  }

  tintColor(bg: string, fg: string, amount: number): string {
    // Simple tint - blend fg into bg
    const parse = (hex: string) => {
      const h = hex.replace('#', '')
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
    }
    const [br, bg2, bb] = parse(bg)
    const [fr, fg2, fb] = parse(fg)
    const r = Math.round(br + (fr - br) * amount)
    const g = Math.round(bg2 + (fg2 - bg2) * amount)
    const b = Math.round(bb + (fb - bb) * amount)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // Draw prompt input box (OpenCode style)
  drawPromptBox(x: number, y: number, width: number, value: string, placeholder: string, focused: boolean) {
    const boxBg = THEME.backgroundElement
    const borderColor = focused ? THEME.primary : THEME.borderSubtle

    // Draw background
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < width; col++) {
        this.drawChar(' ', x + col, y + row, THEME.text, boxBg)
      }
    }

    // Draw border (subtle line at top and bottom)
    for (let col = 0; col < width; col++) {
      this.drawChar('─', x + col, y, borderColor)
      this.drawChar('─', x + col, y + 2, borderColor)
    }

    // Draw text or placeholder
    const displayText = value || placeholder
    const textColor = value ? THEME.text : THEME.textMuted
    this.drawText(displayText, x + 1, y + 1, textColor, width - 2)

    // Draw cursor if focused
    if (focused) {
      const cursorX = x + 1 + value.length
      if (cursorX < x + width - 1) {
        this.drawChar('│', cursorX, y + 1, THEME.primary)
      }
    }

    return 3
  }

  // Draw a message (OpenCode style - simple text with role prefix)
  drawMessage(msg: Message, x: number, y: number, width: number): number {
    const isUser = msg.role === 'user'
    const prefix = isUser ? '› ' : ''
    const prefixColor = isUser ? THEME.primary : THEME.accent
    const textColor = THEME.text

    // Draw prefix
    if (prefix) {
      this.drawText(prefix, x, y, prefixColor)
    }

    // Wrap and draw content
    const contentX = x + prefix.length
    const contentWidth = width - prefix.length
    const lines = this.wrapText(msg.content, contentWidth)

    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], i === 0 ? contentX : x, y + i, textColor, contentWidth)
    }

    return Math.max(lines.length, 1) + 1 // +1 for spacing
  }

  // Draw streaming text with spinner
  drawStreaming(text: string, x: number, y: number, width: number, frame: number): number {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][frame % 10]

    if (!text) {
      // Just show spinner
      this.drawText(spinner, x, y, THEME.primary)
      return 1
    }

    // Show text with cursor
    const lines = this.wrapText(text, width)
    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], x, y + i, THEME.text, width)
    }

    // Cursor at end of last line
    const lastLine = lines[lines.length - 1] || ''
    this.drawChar('▋', x + lastLine.length, y + lines.length - 1, THEME.primary)

    return lines.length
  }

  // Draw footer bar (OpenCode style)
  drawFooter(y: number, directory: string, sessionId: string | null, status: string, version: string) {
    // Draw background
    for (let col = 0; col < this.cols; col++) {
      this.drawChar(' ', col, y, THEME.text, THEME.background)
    }

    // Left: directory
    let x = 2
    x += this.drawText(directory, x, y, THEME.textMuted)
    x += 2

    // Middle: status indicator
    if (sessionId) {
      const statusColor = status === 'ready' ? THEME.success
                        : status === 'processing' ? THEME.warning
                        : THEME.error
      this.drawText('●', x, y, statusColor)
      x += 2
    }

    // Right: version
    const versionText = version
    this.drawText(versionText, this.cols - versionText.length - 2, y, THEME.textMuted)
  }

  // Draw header bar for session view
  drawHeader(y: number, model: string, sessionTitle?: string) {
    // Draw background
    for (let col = 0; col < this.cols; col++) {
      this.drawChar(' ', col, y, THEME.text, THEME.backgroundPanel)
    }

    // Left: session title or "New Session"
    let x = 2
    const title = sessionTitle || 'New Session'
    x += this.drawText(title, x, y, THEME.text)

    // Right: model name
    const modelText = model
    this.drawText(modelText, this.cols - modelText.length - 2, y, THEME.textMuted)
  }

  // Wrap text into lines
  wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = []
    const paragraphs = text.split('\n')

    for (const para of paragraphs) {
      if (!para) {
        lines.push('')
        continue
      }
      const words = para.split(' ')
      let line = ''

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word
        if (testLine.length > maxWidth && line) {
          lines.push(line)
          line = word
        } else {
          line = testLine
        }
      }
      if (line) lines.push(line)
    }

    return lines
  }
}

export default function OpenCodeTUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TUIRenderer | null>(null)
  const [view, setView] = useState<'home' | 'session'>('home')
  const [status, setStatus] = useState<'initializing' | 'ready' | 'processing' | 'error'>('initializing')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [animFrame, setAnimFrame] = useState(0)
  const [streamingText, setStreamingText] = useState('')
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])
  const eventSourceRef = useRef<EventSource | null>(null)
  const statusRef = useRef(status)
  const streamedTextRef = useRef<Map<string, string>>(new Map())
  const scrollOffsetRef = useRef(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Animation loop
  useEffect(() => {
    let frameId: number
    let lastTime = 0
    const animate = (time: number) => {
      if (time - lastTime > 100) { // ~10fps for spinner
        setAnimFrame(f => f + 1)
        lastTime = time
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return

    const renderer = new TUIRenderer(canvasRef.current)
    rendererRef.current = renderer

    // Initial health check
    fetch('/api/proxy/global/health')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setStatus('ready'))
      .catch(() => setStatus('ready'))

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Create session
  const createSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/opencode/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Web Session` }),
      })
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      return data.id
    } catch {
      return null
    }
  }, [])

  // Connect to SSE
  const connectToEvents = useCallback((sessionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`${OPENCODE_SERVER}/event`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.properties?.sessionID && data.properties.sessionID !== sessionId) return

        switch (data.type) {
          case 'message.part.updated': {
            const part = data.properties?.part
            const partIndex = data.properties?.partIndex
            if (!part || partIndex === undefined) break

            if (part.type === 'text' && part.text) {
              setStreamingText(part.text)
              streamedTextRef.current.set(`${partIndex}`, part.text)
            }
            break
          }

          case 'session.updated': {
            const state = data.properties?.session?.state
            if (state === 'completed' || state === 'idle') {
              if (statusRef.current === 'processing') {
                const finalText = Array.from(streamedTextRef.current.values()).join('')
                if (finalText) {
                  setMessages(msgs => {
                    const newMsgs = [...msgs]
                    const lastMsg = newMsgs[newMsgs.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = finalText
                      lastMsg.time.completed = Date.now()
                    }
                    return newMsgs
                  })
                }
                setStreamingText('')
                streamedTextRef.current.clear()
                setStatus('ready')
              }
            }
            break
          }
        }
      } catch (e) {
        console.error('SSE parse error:', e)
      }
    }

    eventSource.onerror = () => {
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          connectToEvents(sessionId)
        }
      }, 2000)
    }
  }, [])

  // Send prompt
  const sendPrompt = useCallback(async (sessionId: string, prompt: string) => {
    streamedTextRef.current.clear()
    setStreamingText('')

    setMessages(msgs => [
      ...msgs,
      { id: `user-${Date.now()}`, role: 'user', content: prompt, time: { created: Date.now() } },
      { id: `assistant-${Date.now()}`, role: 'assistant', content: '', time: { created: Date.now() } }
    ])

    try {
      const response = await fetch(`/api/opencode/sessions/${sessionId}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: [{ type: 'text', text: prompt }] }),
      })

      if (!response.ok) throw new Error('Failed')

      const result = await response.json()
      if (result.parts?.length > 0 && !streamingText) {
        const text = result.parts.filter((p: MessagePart) => p.type === 'text').map((p: MessagePart) => p.text).join('\n')
        if (text) {
          setMessages(msgs => {
            const newMsgs = [...msgs]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = text
              lastMsg.time.completed = Date.now()
            }
            return newMsgs
          })
          setStatus('ready')
        }
      }
    } catch {
      setMessages(msgs => {
        const newMsgs = [...msgs]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = 'Error: Failed to send message'
        }
        return newMsgs
      })
      setStatus('error')
    }
  }, [streamingText])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || status === 'processing') return

    setStatus('processing')
    const prompt = inputValue
    setInputValue('')
    setView('session')

    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = await createSession()
      if (sessionId) {
        setCurrentSessionId(sessionId)
        connectToEvents(sessionId)
      } else {
        setStatus('error')
        return
      }
    }

    await sendPrompt(sessionId, prompt)
  }, [inputValue, status, currentSessionId, createSession, connectToEvents, sendPrompt])

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Backspace') {
        setInputValue(v => v.slice(0, -1))
      } else if (e.key === 'Escape') {
        if (view === 'session' && messages.length === 0) {
          setView('home')
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setInputValue(v => v + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit, view, messages.length])

  // Render loop
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.clear()

    if (view === 'home') {
      // Home view - centered logo and prompt
      const centerX = Math.floor(renderer.cols / 2)
      const centerY = Math.floor(renderer.rows / 2) - 5

      // Draw logo
      const logoHeight = renderer.drawLogo(centerX, centerY)

      // Draw prompt box below logo
      const promptY = centerY + logoHeight + 3
      const promptWidth = Math.min(75, renderer.cols - 4)
      const promptX = centerX - Math.floor(promptWidth / 2)
      renderer.drawPromptBox(promptX, promptY, promptWidth, inputValue, placeholder, true)

      // Draw footer
      renderer.drawFooter(renderer.rows - 1, process.cwd?.() || '~', null, status, 'v1.1.48')
    } else {
      // Session view
      // Header
      renderer.drawHeader(0, 'claude-sonnet-4-20250514', undefined)

      // Messages area
      const contentX = 2
      const contentWidth = renderer.cols - 4
      let y = 2

      for (const msg of messages) {
        if (y >= renderer.rows - 5) break
        const height = renderer.drawMessage(msg, contentX, y, contentWidth)
        y += height
      }

      // Streaming text
      if (status === 'processing') {
        renderer.drawStreaming(streamingText, contentX, y, contentWidth, animFrame)
      }

      // Prompt at bottom
      const promptY = renderer.rows - 4
      renderer.drawPromptBox(2, promptY, renderer.cols - 4, inputValue, placeholder, true)

      // Footer
      renderer.drawFooter(renderer.rows - 1, '~', currentSessionId, status, 'v1.1.48')
    }
  }, [view, messages, inputValue, status, currentSessionId, animFrame, streamingText, placeholder])

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        tabIndex={0}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME.background,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
    outline: 'none',
  },
}
