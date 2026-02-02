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

// TUI Constants
const CELL_W = 9
const CELL_H = 18
const FONT = '14px "SF Mono", Monaco, "Cascadia Code", Consolas, monospace'

// Colors (dark theme)
const COLORS = {
  bg: '#0D1117',
  fg: '#E6EDF3',
  fgWeak: '#8B949E',
  fgStrong: '#FFFFFF',
  border: '#30363D',
  borderFocus: '#58A6FF',
  accent: '#58A6FF',
  success: '#7EE787',
  warning: '#D29922',
  error: '#FF7B72',
  purple: '#BC8CFF',
  cyan: '#76E3EA',
}

// Box drawing characters
const BOX = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  bold: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  round: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: { name: string; args: string; result?: string; state: string }[]
  timestamp: Date
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
    this.ctx.fillStyle = COLORS.bg
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
    const max = maxWidth || (this.cols - x)
    for (let i = 0; i < Math.min(text.length, max); i++) {
      this.drawChar(text[i], x + i, y, fg)
    }
  }

  drawBox(x: number, y: number, w: number, h: number, fg: string, style: 'single' | 'double' | 'bold' | 'round' = 'round', title?: string, titleColor?: string) {
    const c = BOX[style]

    // Corners
    this.drawChar(c.tl, x, y, fg)
    this.drawChar(c.tr, x + w - 1, y, fg)
    this.drawChar(c.bl, x, y + h - 1, fg)
    this.drawChar(c.br, x + w - 1, y + h - 1, fg)

    // Edges
    for (let i = 1; i < w - 1; i++) {
      this.drawChar(c.h, x + i, y, fg)
      this.drawChar(c.h, x + i, y + h - 1, fg)
    }
    for (let i = 1; i < h - 1; i++) {
      this.drawChar(c.v, x, y + i, fg)
      this.drawChar(c.v, x + w - 1, y + i, fg)
    }

    // Title
    if (title) {
      const paddedTitle = ` ${title} `
      const titleX = x + 2
      for (let i = 0; i < paddedTitle.length && titleX + i < x + w - 1; i++) {
        this.drawChar(paddedTitle[i], titleX + i, y, titleColor || fg)
      }
    }
  }

  // Draw wrapped text, returns number of lines used
  drawWrappedText(text: string, x: number, y: number, maxWidth: number, fg: string): number {
    const words = text.split(' ')
    let line = ''
    let lineNum = 0

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      if (testLine.length > maxWidth && line) {
        this.drawText(line, x, y + lineNum, fg)
        line = word
        lineNum++
      } else {
        line = testLine
      }
    }
    if (line) {
      this.drawText(line, x, y + lineNum, fg)
      lineNum++
    }
    return lineNum
  }

  // Draw a message bubble
  drawMessage(msg: ChatMessage, x: number, y: number, width: number): number {
    const isUser = msg.role === 'user'
    const boxColor = isUser ? COLORS.accent : COLORS.border
    const contentColor = isUser ? COLORS.fgStrong : COLORS.fg
    const label = isUser ? '  You' : '󰚩  AI'
    const labelColor = isUser ? COLORS.accent : COLORS.purple

    // Calculate content height
    const contentWidth = width - 4
    const lines = this.wrapText(msg.content, contentWidth)
    let totalHeight = lines.length + 2 // content + padding

    // Add tool calls height
    if (msg.toolCalls) {
      for (const tool of msg.toolCalls) {
        totalHeight += 3 // tool header + spacing
      }
    }

    const boxHeight = Math.max(totalHeight + 2, 4)

    // Draw box
    this.drawBox(x, y, width, boxHeight, boxColor, 'round', label, labelColor)

    // Draw content
    let currentY = y + 1
    for (const line of lines) {
      this.drawText(line, x + 2, currentY, contentColor, contentWidth)
      currentY++
    }

    // Draw tool calls
    if (msg.toolCalls) {
      for (const tool of msg.toolCalls) {
        currentY++
        const stateIcon = tool.state === 'result' ? '✓' : tool.state === 'calling' ? '⚡' : '…'
        const stateColor = tool.state === 'result' ? COLORS.success : COLORS.warning
        this.drawText(`${stateIcon} ${tool.name}`, x + 2, currentY, stateColor)
        currentY++
      }
    }

    return boxHeight + 1
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

  // Draw input area
  drawInput(x: number, y: number, width: number, value: string, focused: boolean, placeholder?: string) {
    const boxColor = focused ? COLORS.borderFocus : COLORS.border
    this.drawBox(x, y, width, 3, boxColor, focused ? 'bold' : 'round')

    const displayText = value || placeholder || ''
    const textColor = value ? COLORS.fg : COLORS.fgWeak

    this.drawText(displayText.slice(0, width - 4), x + 2, y + 1, textColor)

    // Cursor
    if (focused) {
      const cursorX = x + 2 + value.length
      if (cursorX < x + width - 2) {
        this.drawChar('▌', cursorX, y + 1, COLORS.accent)
      }
    }
  }

  // Draw status bar
  drawStatusBar(y: number, sessionId: string | null, status: string) {
    const statusColor = status === 'ready' ? COLORS.success
                       : status === 'processing' ? COLORS.warning
                       : status === 'error' ? COLORS.error
                       : COLORS.fgWeak

    // Left side - status
    const statusIcon = status === 'ready' ? '●' : status === 'processing' ? '◐' : '○'
    this.drawText(`${statusIcon} ${status.charAt(0).toUpperCase() + status.slice(1)}`, 2, y, statusColor)

    // Right side - session
    if (sessionId) {
      const sessionText = `Session: ${sessionId.substring(0, 8)}…`
      this.drawText(sessionText, this.cols - sessionText.length - 2, y, COLORS.fgWeak)
    }
  }

  // Draw header
  drawHeader(title: string) {
    this.drawBox(0, 0, this.cols, 3, COLORS.border, 'round')

    // Logo
    this.drawText('󰚩', 2, 1, COLORS.purple)

    // Title
    this.drawText(title, 4, 1, COLORS.fgStrong)

    // Version badge
    const version = 'v1.0'
    this.drawText(version, this.cols - version.length - 2, 1, COLORS.fgWeak)
  }

  // Draw scrollbar
  drawScrollbar(x: number, y: number, height: number, scrollPos: number, contentHeight: number) {
    if (contentHeight <= height) return

    const thumbHeight = Math.max(2, Math.floor(height * height / contentHeight))
    const thumbPos = Math.floor((height - thumbHeight) * scrollPos / (contentHeight - height))

    for (let i = 0; i < height; i++) {
      const char = i >= thumbPos && i < thumbPos + thumbHeight ? '█' : '░'
      this.drawChar(char, x, y + i, COLORS.fgWeak)
    }
  }

  // Draw thinking indicator
  drawThinking(x: number, y: number, frame: number) {
    const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    const spinner = dots[frame % dots.length]
    this.drawText(`${spinner} Thinking...`, x, y, COLORS.warning)
  }

  // Draw streaming text with cursor
  drawStreamingText(text: string, x: number, y: number, width: number, fg: string): number {
    const lines = this.wrapText(text, width)
    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], x, y + i, fg)
    }
    // Blinking cursor at end
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1]
      this.drawChar('▌', x + lastLine.length, y + lines.length - 1, COLORS.accent)
    }
    return lines.length
  }
}

export default function OpenCodeTUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TUIRenderer | null>(null)
  const [status, setStatus] = useState<'initializing' | 'ready' | 'processing' | 'error'>('initializing')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [scrollOffset, setScrollOffset] = useState(0)
  const [animFrame, setAnimFrame] = useState(0)
  const [streamingText, setStreamingText] = useState('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const statusRef = useRef(status)
  const streamedTextRef = useRef<Map<string, string>>(new Map())
  const lastDisplayedLengthRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Animation loop
  useEffect(() => {
    let frameId: number
    const animate = () => {
      setAnimFrame(f => f + 1)
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
      .catch(() => setStatus('ready')) // Still allow usage

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
        body: JSON.stringify({ title: `Web TUI Session - ${new Date().toISOString()}` }),
      })

      if (!response.ok) throw new Error('Failed to create session')
      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Failed to create session:', error)
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

        if (data.properties?.sessionID && data.properties.sessionID !== sessionId) {
          return
        }

        switch (data.type) {
          case 'message.part.updated': {
            const part = data.properties?.part as MessagePart | undefined
            const partIndex = data.properties?.partIndex as number | undefined

            if (!part || partIndex === undefined) break

            const partKey = `${partIndex}`

            if (part.type === 'text' && part.text) {
              setStreamingText(part.text)
              streamedTextRef.current.set(partKey, part.text)
            } else if (part.type === 'tool-invocation' && part.toolInvocation) {
              const tool = part.toolInvocation
              setMessages(msgs => {
                const newMsgs = [...msgs]
                const lastMsg = newMsgs[newMsgs.length - 1]
                if (lastMsg && lastMsg.role === 'assistant') {
                  const toolCalls = lastMsg.toolCalls || []
                  const existingIdx = toolCalls.findIndex(t => t.name === tool.toolName)
                  if (existingIdx >= 0) {
                    toolCalls[existingIdx] = {
                      name: tool.toolName || '',
                      args: JSON.stringify(tool.args || {}),
                      result: tool.result ? JSON.stringify(tool.result) : undefined,
                      state: tool.state || 'calling'
                    }
                  } else {
                    toolCalls.push({
                      name: tool.toolName || '',
                      args: JSON.stringify(tool.args || {}),
                      state: tool.state || 'calling'
                    })
                  }
                  lastMsg.toolCalls = toolCalls
                }
                return newMsgs
              })
            }
            break
          }

          case 'session.updated': {
            const state = data.properties?.session?.state
            if (state === 'completed' || state === 'idle') {
              if (statusRef.current === 'processing') {
                // Finalize streaming text as message
                const finalText = Array.from(streamedTextRef.current.values()).join('')
                if (finalText) {
                  setMessages(msgs => {
                    const newMsgs = [...msgs]
                    const lastMsg = newMsgs[newMsgs.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = finalText
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
        console.error('Failed to parse SSE event:', e)
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

    // Add user message
    setMessages(msgs => [...msgs, {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])

    // Add placeholder assistant message
    setMessages(msgs => [...msgs, {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }])

    try {
      const response = await fetch(`/api/opencode/sessions/${sessionId}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: [{ type: 'text', text: prompt }] }),
      })

      if (!response.ok) {
        throw new Error('Failed to send prompt')
      }

      const result = await response.json()

      // If SSE didn't catch the response, use the direct response
      if (result.parts && Array.isArray(result.parts)) {
        const textParts = result.parts
          .filter((p: MessagePart) => p.type === 'text' && p.text)
          .map((p: MessagePart) => p.text)
          .join('\n')

        if (textParts && !streamingText) {
          setMessages(msgs => {
            const newMsgs = [...msgs]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = textParts
            }
            return newMsgs
          })
          setStatus('ready')
        }
      }
    } catch (error) {
      console.error('Failed to send prompt:', error)
      setMessages(msgs => {
        const newMsgs = [...msgs]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = `Error: ${String(error)}`
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
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setInputValue(v => v + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit])

  // Render loop
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.clear()

    // Header
    renderer.drawHeader('OpenCode')

    // Messages area
    const messagesY = 4
    const messagesHeight = renderer.rows - 10
    const messagesWidth = renderer.cols - 4

    // Draw messages box
    renderer.drawBox(1, messagesY - 1, renderer.cols - 2, messagesHeight + 2, COLORS.border, 'round', ' Chat ', COLORS.fgWeak)

    // Draw messages
    let currentY = messagesY
    const visibleMessages = messages.slice(-10) // Show last 10 messages

    for (const msg of visibleMessages) {
      if (currentY >= messagesY + messagesHeight - 4) break
      const height = renderer.drawMessage(msg, 3, currentY, messagesWidth - 4)
      currentY += height
    }

    // Draw streaming text
    if (status === 'processing' && streamingText) {
      renderer.drawStreamingText(streamingText, 5, currentY, messagesWidth - 8, COLORS.fg)
    } else if (status === 'processing') {
      renderer.drawThinking(5, currentY, animFrame)
    }

    // Input area
    const inputY = renderer.rows - 5
    renderer.drawInput(1, inputY, renderer.cols - 2, inputValue, true, 'Type your message...')

    // Status bar
    renderer.drawStatusBar(renderer.rows - 1, currentSessionId, status)

  }, [messages, inputValue, status, currentSessionId, animFrame, streamingText])

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        tabIndex={0}
      />
      <div style={styles.hint}>
        Press <kbd style={styles.kbd}>Enter</kbd> to send • <kbd style={styles.kbd}>Ctrl+C</kbd> to cancel
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '600px',
    backgroundColor: COLORS.bg,
    borderRadius: '12px',
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
  },
  canvas: {
    width: '100%',
    height: 'calc(100% - 40px)',
    display: 'block',
  },
  hint: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: COLORS.fgWeak,
    fontSize: '12px',
    borderTop: `1px solid ${COLORS.border}`,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  kbd: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: '11px',
    border: `1px solid ${COLORS.border}`,
  },
}
