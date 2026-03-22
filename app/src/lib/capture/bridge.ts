import type { ArcadeStep } from '../../types/arcade'

/**
 * Check chrome.storage.local for a pending capture session
 * from the Chrome extension. Returns null if none found or
 * if running outside an extension context.
 */
export async function getPendingSession(): Promise<{
  id: string
  steps: ExtensionStep[]
  capturedAt: number
} | null> {
  try {
    // chrome.storage may not exist if extension isn't installed
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return null
    }
    const result = await chrome.storage.local.get('pendingSession')
    return (result.pendingSession as { id: string; steps: ExtensionStep[]; capturedAt: number }) ?? null
  } catch {
    return null
  }
}

export async function clearPendingSession(): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.remove('pendingSession')
    }
  } catch {
    // Not in extension context
  }
}

interface ExtensionStep {
  id: string
  type: 'click' | 'scroll' | 'input'
  timestamp: number
  url: string
  viewportWidth: number
  viewportHeight: number
  screenshot?: string // base64 data URI
  clickTarget?: {
    x: number
    y: number
    selector: string
    label: string
  }
}

/**
 * Convert extension steps (with base64 screenshots) into
 * ArcadeStep objects (with Blob screenshots) for IndexedDB.
 */
export async function convertExtensionSteps(
  projectId: string,
  extensionSteps: ExtensionStep[],
): Promise<ArcadeStep[]> {
  return Promise.all(
    extensionSteps.map(async (es, index) => {
      let screenshot: Blob
      if (es.screenshot) {
        const res = await fetch(es.screenshot)
        screenshot = await res.blob()
      } else {
        // Create a tiny placeholder blob
        screenshot = new Blob([''], { type: 'image/jpeg' })
      }

      return {
        id: es.id,
        projectId,
        order: index,
        type: es.type,
        screenshot,
        clickTarget: es.clickTarget,
        duration: 3000, // default 3s per step
        transition: 'fade' as const,
        url: es.url,
        viewportWidth: es.viewportWidth,
        viewportHeight: es.viewportHeight,
      }
    }),
  )
}
