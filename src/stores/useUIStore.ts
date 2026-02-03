import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type MainTab = 'chat' | 'terminal' | 'files' | 'git' | 'settings' | 'agents';

interface UIState {
  isSidebarOpen: boolean;
  activeMainTab: MainTab;
  isMobile: boolean;
  isSettingsDialogOpen: boolean;
  isSessionSwitcherOpen: boolean;
  isAboutDialogOpen: boolean;
  sidebarWidth: number;

  setSidebarOpen: (open: boolean) => void;
  setActiveMainTab: (tab: MainTab) => void;
  setMobile: (isMobile: boolean) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setSessionSwitcherOpen: (open: boolean) => void;
  setAboutDialogOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    isSidebarOpen: true,
    activeMainTab: 'chat',
    isMobile: false,
    isSettingsDialogOpen: false,
    isSessionSwitcherOpen: false,
    isAboutDialogOpen: false,
    sidebarWidth: 280,

    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setActiveMainTab: (activeMainTab) => set({ activeMainTab }),
    setMobile: (isMobile) => set({ isMobile }),
    setSettingsDialogOpen: (isSettingsDialogOpen) => set({ isSettingsDialogOpen }),
    setSessionSwitcherOpen: (isSessionSwitcherOpen) => set({ isSessionSwitcherOpen }),
    setAboutDialogOpen: (isAboutDialogOpen) => set({ isAboutDialogOpen }),
    setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  }))
);
