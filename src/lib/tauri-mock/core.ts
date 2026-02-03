// Mock for @tauri-apps/api/core
export type Channel<T> = {
  id: string
  name: string
}

export const invoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
  console.log(`Tauri invoke called: ${cmd}`, args)
  // Return a default empty response
  return {} as T
}

export const convertFileSrc = (filePath: string): string => {
  // In web environment, just return the file path
  // In a real implementation, this might need to handle file serving
  return filePath
}

export const transformCallback = (callback: (response: any) => void): string => {
  // Return a mock callback ID
  return `callback_${Math.random().toString(36).substr(2, 9)}`
}

export const getCurrentWindowFromCore = () => {
  return {
    label: 'main'
  }
}