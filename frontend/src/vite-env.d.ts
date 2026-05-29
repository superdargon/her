/// <reference types="vite/client" />

export {}

declare global {
  interface Window {
    electronAPI?: {
      getConfig: () => Promise<Record<string, unknown>>
      setConfig: (key: string, value: unknown) => Promise<void>
      getServerPort: () => Promise<number>
      onServerUrl: (callback: (url: string) => void) => void
      openPet: () => void
      closePet: () => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (callback: (isMax: boolean) => void) => void
    }
  }
}
