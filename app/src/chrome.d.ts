// Ambient declaration for chrome.storage API used in the capture bridge.
// Only available when the app is accessed from a Chrome extension context.
declare namespace chrome {
  namespace storage {
    const local: {
      get(keys: string | string[]): Promise<Record<string, unknown>>
      set(items: Record<string, unknown>): Promise<void>
      remove(keys: string | string[]): Promise<void>
    } | undefined
  }
}
