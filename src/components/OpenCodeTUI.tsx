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

interface Model {
  id: string
  name: string
  providerID: string
  providerName: string
  family: string
}

// Server URL for direct SSE connection
const OPENCODE_SERVER = process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

// TUI Constants
const CELL_W = 9
const CELL_H = 18
const FONT = '14px "SF Mono", Monaco, "Cascadia Code", Consolas, monospace'

// OpenCode Theme Colors (dark mode)
const THEME = {
  background: '#0a0a0a',
  backgroundPanel: '#141414',
  backgroundElement: '#1e1e1e',
  primary: '#fab283',
  secondary: '#5c9cf5',
  accent: '#9d7cd8',
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

// Logo data from OpenCode
const LOGO = {
  left: ["                   ", "█▀▀█ █▀▀█ █▀▀█ █▀▀▄", "█__█ █__█ █^^^ █__█", "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀"],
  right: ["             ▄     ", "█▀▀▀ █▀▀█ █▀▀█ █▀▀█", "█___ █__█ █__█ █^^^", "▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀"],
}

const PLACEHOLDERS = [
  "Fix a TODO in the codebase",
  "What is the tech stack of this project?",
  "Fix broken tests",
]

// Default models (popular ones)
const DEFAULT_MODELS: Model[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', providerID: 'anthropic', providerName: 'Anthropic', family: 'claude' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', providerID: 'anthropic', providerName: 'Anthropic', family: 'claude' },
  { id: 'gpt-4o', name: 'GPT-4o', providerID: 'openai', providerName: 'OpenAI', family: 'gpt' },
  { id: 'gpt-4.1', name: 'GPT-4.1', providerID: 'openai', providerName: 'OpenAI', family: 'gpt' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', providerID: 'google', providerName: 'Google', family: 'gemini' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', providerID: 'deepseek', providerName: 'DeepSeek', family: 'deepseek' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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

  tintColor(bg: string, fg: string, amount: number): string {
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

  drawLogo(centerX: number, y: number) {
    const shadow = this.tintColor(THEME.background, THEME.textMuted, 0.25)
    const renderLine = (line: string, x: number, y: number, fg: string) => {
      let cx = x
      for (const char of line) {
        if (char === '_') this.drawChar(' ', cx, y, fg, shadow)
        else if (char === '^') this.drawChar('▀', cx, y, fg, shadow)
        else if (char === '~') this.drawChar('▀', cx, y, shadow)
        else this.drawChar(char, cx, y, fg)
        cx++
      }
    }
    const logoWidth = LOGO.left[0].length + 1 + LOGO.right[0].length
    const startX = centerX - Math.floor(logoWidth / 2)
    for (let i = 0; i < LOGO.left.length; i++) {
      renderLine(LOGO.left[i], startX, y + i, THEME.textMuted)
      renderLine(LOGO.right[i], startX + LOGO.left[i].length + 1, y + i, THEME.text)
    }
    return LOGO.left.length
  }

  drawPromptBox(x: number, y: number, width: number, value: string, placeholder: string, focused: boolean) {
    const boxBg = THEME.backgroundElement
    const borderColor = focused ? THEME.primary : THEME.borderSubtle
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < width; col++) {
        this.drawChar(' ', x + col, y + row, THEME.text, boxBg)
      }
    }
    for (let col = 0; col < width; col++) {
      this.drawChar('─', x + col, y, borderColor)
      this.drawChar('─', x + col, y + 2, borderColor)
    }
    const displayText = value || placeholder
    const textColor = value ? THEME.text : THEME.textMuted
    this.drawText(displayText, x + 1, y + 1, textColor, width - 2)
    if (focused && value.length < width - 2) {
      this.drawChar('│', x + 1 + value.length, y + 1, THEME.primary)
    }
    return 3
  }

  drawMessage(msg: Message, x: number, y: number, width: number): number {
    const isUser = msg.role === 'user'
    const prefix = isUser ? '› ' : ''
    const prefixColor = isUser ? THEME.primary : THEME.accent
    if (prefix) this.drawText(prefix, x, y, prefixColor)
    const contentX = x + prefix.length
    const contentWidth = width - prefix.length
    const lines = this.wrapText(msg.content, contentWidth)
    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], i === 0 ? contentX : x, y + i, THEME.text, contentWidth)
    }
    return Math.max(lines.length, 1) + 1
  }

  drawStreaming(text: string, x: number, y: number, width: number, frame: number): number {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][frame % 10]
    if (!text) {
      this.drawText(spinner, x, y, THEME.primary)
      return 1
    }
    const lines = this.wrapText(text, width)
    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], x, y + i, THEME.text, width)
    }
    const lastLine = lines[lines.length - 1] || ''
    this.drawChar('▋', x + lastLine.length, y + lines.length - 1, THEME.primary)
    return lines.length
  }

  drawFooter(y: number, model: string, sessionId: string | null, status: string) {
    for (let col = 0; col < this.cols; col++) {
      this.drawChar(' ', col, y, THEME.text, THEME.background)
    }
    let x = 2
    // Model selector hint
    this.drawText('F2', x, y, THEME.textMuted)
    x += 3
    this.drawText(model, x, y, THEME.primary)
    x += model.length + 2

    if (sessionId) {
      const statusColor = status === 'ready' ? THEME.success : status === 'processing' ? THEME.warning : THEME.error
      this.drawText('●', x, y, statusColor)
    }

    // Right side: version
    const version = 'v1.1.48'
    this.drawText(version, this.cols - version.length - 2, y, THEME.textMuted)
  }

  drawHeader(y: number, title: string) {
    for (let col = 0; col < this.cols; col++) {
      this.drawChar(' ', col, y, THEME.text, THEME.backgroundPanel)
    }
    this.drawText(title || 'New Session', 2, y, THEME.text)
  }

  // Draw model selector dialog
  drawModelSelector(models: Model[], selectedIndex: number, searchQuery: string) {
    const dialogWidth = 60
    const dialogHeight = Math.min(models.length + 6, this.rows - 4)
    const x = Math.floor((this.cols - dialogWidth) / 2)
    const y = Math.floor((this.rows - dialogHeight) / 2)

    // Draw backdrop
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawChar(' ', col, row, THEME.text, 'rgba(0,0,0,0.7)')
      }
    }

    // Draw dialog box
    for (let row = 0; row < dialogHeight; row++) {
      for (let col = 0; col < dialogWidth; col++) {
        this.drawChar(' ', x + col, y + row, THEME.text, THEME.backgroundPanel)
      }
    }

    // Draw border
    for (let col = 0; col < dialogWidth; col++) {
      this.drawChar('─', x + col, y, THEME.border)
      this.drawChar('─', x + col, y + dialogHeight - 1, THEME.border)
    }
    for (let row = 0; row < dialogHeight; row++) {
      this.drawChar('│', x, y + row, THEME.border)
      this.drawChar('│', x + dialogWidth - 1, y + row, THEME.border)
    }
    this.drawChar('╭', x, y, THEME.border)
    this.drawChar('╮', x + dialogWidth - 1, y, THEME.border)
    this.drawChar('╰', x, y + dialogHeight - 1, THEME.border)
    this.drawChar('╯', x + dialogWidth - 1, y + dialogHeight - 1, THEME.border)

    // Title
    this.drawText(' Switch Model ', x + 2, y, THEME.primary)

    // Search box
    this.drawText('Search: ', x + 2, y + 2, THEME.textMuted)
    this.drawText(searchQuery || '(type to filter)', x + 10, y + 2, searchQuery ? THEME.text : THEME.textMuted)

    // Model list
    const listY = y + 4
    const maxVisible = dialogHeight - 6
    const startIdx = Math.max(0, selectedIndex - Math.floor(maxVisible / 2))

    for (let i = 0; i < maxVisible && startIdx + i < models.length; i++) {
      const model = models[startIdx + i]
      const isSelected = startIdx + i === selectedIndex
      const rowY = listY + i

      if (isSelected) {
        for (let col = 1; col < dialogWidth - 1; col++) {
          this.drawChar(' ', x + col, rowY, THEME.text, THEME.backgroundElement)
        }
        this.drawText('>', x + 2, rowY, THEME.primary)
      }

      const displayName = `${model.name} (${model.providerName})`
      this.drawText(displayName, x + 4, rowY, isSelected ? THEME.text : THEME.textMuted, dialogWidth - 6)
    }

    // Help text
    this.drawText('↑↓ navigate  Enter select  Esc cancel', x + 2, y + dialogHeight - 2, THEME.textMuted)
  }

  wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = []
    for (const para of text.split('\n')) {
      if (!para) { lines.push(''); continue }
      let line = ''
      for (const word of para.split(' ')) {
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

  // Model selection state
  const [models, setModels] = useState<Model[]>(DEFAULT_MODELS)
  const [selectedModel, setSelectedModel] = useState<Model>(DEFAULT_MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [modelSelectorIndex, setModelSelectorIndex] = useState(0)
  const [modelSearchQuery, setModelSearchQuery] = useState('')

  const eventSourceRef = useRef<EventSource | null>(null)
  const statusRef = useRef(status)
  const streamedTextRef = useRef<Map<string, string>>(new Map())

  useEffect(() => { statusRef.current = status }, [status])

  // Fetch models
  useEffect(() => {
    fetch('/api/opencode/models')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.models?.length > 0) {
          setModels(data.models)
          // Keep default if available
          const defaultModel = data.models.find((m: Model) => m.id === 'claude-sonnet-4-20250514')
          if (defaultModel) setSelectedModel(defaultModel)
        }
      })
      .catch(() => {/* Use default models */})
  }, [])

  // Filtered models based on search
  const filteredModels = modelSearchQuery
    ? models.filter(m =>
        m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        m.providerName.toLowerCase().includes(modelSearchQuery.toLowerCase())
      )
    : models

  // Animation loop
  useEffect(() => {
    let frameId: number
    let lastTime = 0
    const animate = (time: number) => {
      if (time - lastTime > 100) {
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
    fetch('/api/proxy/global/health')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setStatus('ready'))
      .catch(() => setStatus('ready'))
    return () => { eventSourceRef.current?.close() }
  }, [])

  const createSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/opencode/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Web Session` }),
      })
      if (!response.ok) throw new Error('Failed')
      return (await response.json()).id
    } catch { return null }
  }, [])

  const connectToEvents = useCallback((sessionId: string) => {
    eventSourceRef.current?.close()
    const eventSource = new EventSource(`${OPENCODE_SERVER}/event`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.properties?.sessionID && data.properties.sessionID !== sessionId) return

        if (data.type === 'message.part.updated') {
          const part = data.properties?.part
          const partIndex = data.properties?.partIndex
          if (part?.type === 'text' && part.text) {
            setStreamingText(part.text)
            streamedTextRef.current.set(`${partIndex}`, part.text)
          }
        } else if (data.type === 'session.updated') {
          const state = data.properties?.session?.state
          if ((state === 'completed' || state === 'idle') && statusRef.current === 'processing') {
            const finalText = Array.from(streamedTextRef.current.values()).join('')
            if (finalText) {
              setMessages(msgs => {
                const newMsgs = [...msgs]
                const lastMsg = newMsgs[newMsgs.length - 1]
                if (lastMsg?.role === 'assistant') {
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
      } catch (e) { console.error('SSE parse error:', e) }
    }

    eventSource.onerror = () => {
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) connectToEvents(sessionId)
      }, 2000)
    }
  }, [])

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
        body: JSON.stringify({
          parts: [{ type: 'text', text: prompt }],
          model: selectedModel.id,
          providerID: selectedModel.providerID,
        }),
      })

      if (!response.ok) throw new Error('Failed')
      const result = await response.json()
      if (result.status === 'sent' || result.status === 'processing') return

      if (result.parts?.length > 0) {
        const text = result.parts.filter((p: MessagePart) => p.type === 'text').map((p: MessagePart) => p.text).join('\n')
        if (text) {
          setMessages(msgs => {
            const newMsgs = [...msgs]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg?.role === 'assistant') {
              lastMsg.content = text
              lastMsg.time.completed = Date.now()
            }
            return newMsgs
          })
          setStatus('ready')
        }
      }
    } catch (error) {
      console.error('Send prompt error:', error)
      setMessages(msgs => {
        const newMsgs = [...msgs]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg?.role === 'assistant') lastMsg.content = 'Error: Failed to send message'
        return newMsgs
      })
      setStatus('error')
    }
  }, [selectedModel])

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
      // Model selector is open
      if (showModelSelector) {
        e.preventDefault()
        if (e.key === 'Escape') {
          setShowModelSelector(false)
          setModelSearchQuery('')
        } else if (e.key === 'ArrowUp') {
          setModelSelectorIndex(i => Math.max(0, i - 1))
        } else if (e.key === 'ArrowDown') {
          setModelSelectorIndex(i => Math.min(filteredModels.length - 1, i + 1))
        } else if (e.key === 'Enter') {
          if (filteredModels[modelSelectorIndex]) {
            setSelectedModel(filteredModels[modelSelectorIndex])
          }
          setShowModelSelector(false)
          setModelSearchQuery('')
        } else if (e.key === 'Backspace') {
          setModelSearchQuery(q => q.slice(0, -1))
          setModelSelectorIndex(0)
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setModelSearchQuery(q => q + e.key)
          setModelSelectorIndex(0)
        }
        return
      }

      // Open model selector with F2 or Ctrl+M
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'm')) {
        e.preventDefault()
        setShowModelSelector(true)
        setModelSelectorIndex(filteredModels.findIndex(m => m.id === selectedModel.id))
        return
      }

      // Normal input handling
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Backspace') {
        setInputValue(v => v.slice(0, -1))
      } else if (e.key === 'Escape') {
        if (view === 'session' && messages.length === 0) setView('home')
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setInputValue(v => v + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit, view, messages.length, showModelSelector, filteredModels, modelSelectorIndex, selectedModel.id])

  // Render loop
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.clear()

    if (view === 'home') {
      const centerX = Math.floor(renderer.cols / 2)
      const centerY = Math.floor(renderer.rows / 2) - 5
      const logoHeight = renderer.drawLogo(centerX, centerY)
      const promptY = centerY + logoHeight + 3
      const promptWidth = Math.min(75, renderer.cols - 4)
      const promptX = centerX - Math.floor(promptWidth / 2)
      renderer.drawPromptBox(promptX, promptY, promptWidth, inputValue, placeholder, true)
      renderer.drawFooter(renderer.rows - 1, selectedModel.name, null, status)
    } else {
      renderer.drawHeader(0, 'Session')
      const contentX = 2
      const contentWidth = renderer.cols - 4
      let y = 2

      for (const msg of messages) {
        if (y >= renderer.rows - 5) break
        y += renderer.drawMessage(msg, contentX, y, contentWidth)
      }

      if (status === 'processing') {
        renderer.drawStreaming(streamingText, contentX, y, contentWidth, animFrame)
      }

      renderer.drawPromptBox(2, renderer.rows - 4, renderer.cols - 4, inputValue, placeholder, true)
      renderer.drawFooter(renderer.rows - 1, selectedModel.name, currentSessionId, status)
    }

    // Draw model selector on top if open
    if (showModelSelector) {
      renderer.drawModelSelector(filteredModels, modelSelectorIndex, modelSearchQuery)
    }
  }, [view, messages, inputValue, status, currentSessionId, animFrame, streamingText, placeholder, selectedModel, showModelSelector, filteredModels, modelSelectorIndex, modelSearchQuery])

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} tabIndex={0} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: THEME.background, overflow: 'hidden' },
  canvas: { width: '100%', height: '100%', display: 'block', outline: 'none' },
}
