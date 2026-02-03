// Mock for @tauri-apps/api/window
export const appWindow = {
  show: async () => {},
  hide: async () => {},
  minimize: async () => {},
  maximize: async () => {},
  unmaximize: async () => {},
  toggleMaximize: async () => {},
  close: async () => {},
  setTitle: async () => {},
  getTitle: async () => '',
  setSize: async () => {},
  getSize: async () => ({ width: 800, height: 600 }),
  setPosition: async () => {},
  getPosition: async () => ({ x: 0, y: 0 }),
  center: async () => {},
  requestUserAttention: async () => {},
  setResizable: async () => {},
  setMaximizable: async () => {},
  setMinimizable: async () => {},
  setClosable: async () => {},
  setDecorations: async () => {},
  setAlwaysOnTop: async () => {},
  setFullscreen: async () => {},
  isFullscreen: async () => false,
  isMaximized: async () => false,
  isMinimized: async () => false,
  isDecorated: async () => false,
  isVisible: async () => true,
  isResizable: async () => true,
  isMaximizable: async () => true,
  isMinimizable: async () => true,
  isClosable: async () => true,
  isAlwaysOnTop: async () => false,
}

export const getCurrentWindow = () => appWindow

export const getAllWindows = async () => [appWindow]

// Physical size mock
export const physicalSize = {
  toLogical: (size: { width: number; height: number }) => size,
  fromLogical: (size: { width: number; height: number }) => size,
}

// Logical size mock
export const logicalSize = {
  toPhysical: (size: { width: number; height: number }) => size,
  fromPhysical: (size: { width: number; height: number }) => size,
}

// Position mock
export const LogicalPosition = class {
  constructor(public x: number, public y: number) {}
  toPhysical: () => ({ x: 0, y: 0 })
}

export const PhysicalPosition = class {
  constructor(public x: number, public y: number) {}
  toLogical: () => ({ x: 0, y: 0 })
}