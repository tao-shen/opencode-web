import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Message, Session, ChatMessage } from '@/types';

interface SessionState {
  sessions: Map<string, Session>;
  currentSessionId: string | null;
  messages: Map<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;

  setCurrentSession: (sessionId: string) => void;
  createSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set) => ({
        sessions: new Map(),
        currentSessionId: null,
        messages: new Map(),
        isLoading: false,
        error: null,

        setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

        createSession: (session) =>
          set((state) => {
            const newSessions = new Map(state.sessions);
            newSessions.set(session.id, session);
            return { sessions: newSessions, currentSessionId: session.id };
          }),

        deleteSession: (sessionId) =>
          set((state) => {
            const newSessions = new Map(state.sessions);
            newSessions.delete(sessionId);
            const newMessages = new Map(state.messages);
            newMessages.delete(sessionId);
            return {
              sessions: newSessions,
              messages: newMessages,
              currentSessionId:
                state.currentSessionId === sessionId ? null : state.currentSessionId,
            };
          }),

        addMessage: (sessionId, message) =>
          set((state) => {
            const newMessages = new Map(state.messages);
            const sessionMessages = newMessages.get(sessionId) || [];
            newMessages.set(sessionId, [...sessionMessages, message]);
            return { messages: newMessages };
          }),

        setMessages: (sessionId, messages) =>
          set((state) => {
            const newMessages = new Map(state.messages);
            newMessages.set(sessionId, messages);
            return { messages: newMessages };
          }),

        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'openchamber-sessions',
        partialize: (state) =>
          Object.fromEntries(state.sessions.entries()) as Record<string, Session>,
      }
    )
  )
);
