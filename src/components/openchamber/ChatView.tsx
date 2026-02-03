'use client';

import { useState, useRef, useEffect } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useConfigStore } from '@/stores/useConfigStore';

export default function ChatView() {
  const { currentSessionId, messages, addMessage } = useSessionStore();
  const { openCodeServerURL } = useConfigStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMessages = currentSessionId ? messages.get(currentSessionId) || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId || isLoading) return;

    const userMessage: any = {
      id: crypto.randomUUID(),
      sessionID: currentSessionId,
      role: 'user' as const,
      content: input,
      time: Date.now(),
    };

    addMessage(currentSessionId, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${openCodeServerURL}/api/opencode/sessions/${currentSessionId}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const assistantMessage: any = {
          id: crypto.randomUUID(),
          sessionID: currentSessionId,
          role: 'assistant' as const,
          content: data.data.result || data.data.message || 'No response',
          time: Date.now(),
        };
        addMessage(currentSessionId, assistantMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage(currentSessionId, {
        id: crypto.randomUUID(),
        sessionID: currentSessionId,
        role: 'assistant' as const,
        content: 'Failed to send message. Please try again.',
        time: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages.length, currentSessionId]);

  if (!currentSessionId) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000000',
      }}
    >
      <div
        ref={messagesEndRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {currentMessages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#86868B',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <div style={{ fontSize: '16px' }}>Start a conversation</div>
            <div style={{ fontSize: '14px', color: '#86868B', marginTop: '8px' }}>
              Type a message below to begin chatting with OpenCode.
            </div>
          </div>
        ) : (
          currentMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: message.role === 'user' ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                maxWidth: '800px',
                marginLeft: message.role === 'assistant' ? 'auto' : '0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: message.role === 'user' ? '#007AFF' : '#86868B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{ fontSize: '12px', color: '#86868B' }}>
                  {new Date(message.time).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#F5F5F7', whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Type your message... (Press Enter to send)"
            disabled={isLoading}
            style={{
              flex: 1,
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#F5F5F7',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              background: '#007AFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}
