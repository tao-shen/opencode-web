import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ModelConfig {
  id: string;
  providerID: string;
  modelID: string;
  name: string;
  limit?: {
    context?: number;
    output?: number;
  };
}

interface ConfigState {
  openCodeServerURL: string;
  currentModel: ModelConfig | null;
  uiFont: string;
  monoFont: string;
  theme: 'light' | 'dark' | 'auto';
  sessionRetentionDays: number;

  setServerURL: (url: string) => void;
  setCurrentModel: (model: ModelConfig) => void;
  setUIFont: (font: string) => void;
  setMonoFont: (font: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSessionRetentionDays: (days: number) => void;
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set) => ({
        openCodeServerURL: process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL || 'http://localhost:4096',
        currentModel: null,
        uiFont: 'default',
        monoFont: 'default',
        theme: 'dark',
        sessionRetentionDays: 30,

        setServerURL: (url) => set({ openCodeServerURL: url }),
        setCurrentModel: (model) => set({ currentModel: model }),
        setUIFont: (font) => set({ uiFont: font }),
        setMonoFont: (font) => set({ monoFont: font }),
        setTheme: (theme) => set({ theme }),
        setSessionRetentionDays: (days) => set({ sessionRetentionDays: days }),
      }),
      {
        name: 'openchamber-config',
      }
    )
  )
);
