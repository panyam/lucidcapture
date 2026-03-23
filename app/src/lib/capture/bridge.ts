import type { SceneStep } from '../../types/scene'

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

interface PendingSession {
  id: string
  steps: ExtensionStep[]
  capturedAt: number
}

/**
 * Wait for the extension to post session data via window.postMessage.
 * The extension injects a content script into the /editor/import page
 * that posts { type: 'LUCID_CAPTURE_IMPORT', session: {...} }.
 *
 * Falls back to chrome.storage.local if available (extension context).
 * Returns null after timeout if no data arrives.
 */
export function waitForPendingSession(timeoutMs = 10000): Promise<PendingSession | null> {
  return new Promise((resolve) => {
    let resolved = false

    // Method 1: Listen for postMessage from extension content script
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'LUCID_CAPTURE_IMPORT' && event.data.session) {
        if (resolved) return
        resolved = true
        window.removeEventListener('message', handleMessage)
        resolve(event.data.session as PendingSession)
      }
    }
    window.addEventListener('message', handleMessage)

    // Method 2: Try chrome.storage.local (works if page is in extension context)
    ;(async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await chrome.storage.local.get('pendingSession')
          const ps = result.pendingSession as PendingSession | undefined
          if (ps && ps.steps?.length > 0 && !resolved) {
            resolved = true
            window.removeEventListener('message', handleMessage)
            await chrome.storage.local.remove('pendingSession')
            resolve(ps)
          }
        }
      } catch {
        // Not in extension context
      }
    })()

    // Timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        window.removeEventListener('message', handleMessage)
        resolve(null)
      }
    }, timeoutMs)
  })
}

/**
 * Convert extension steps (with base64 screenshots) into
 * SceneStep objects (with Blob screenshots) for IndexedDB.
 */
export async function convertExtensionSteps(
  projectId: string,
  extensionSteps: ExtensionStep[],
): Promise<SceneStep[]> {
  return Promise.all(
    extensionSteps.map(async (es, index) => {
      let screenshot: Blob
      if (es.screenshot) {
        const res = await fetch(es.screenshot)
        screenshot = await res.blob()
      } else {
        screenshot = new Blob([''], { type: 'image/jpeg' })
      }

      return {
        id: es.id,
        projectId,
        order: index,
        type: es.type,
        screenshot,
        clickTarget: es.clickTarget,
        duration: 3000,
        transition: 'fade' as const,
        url: es.url,
        viewportWidth: es.viewportWidth,
        viewportHeight: es.viewportHeight,
      }
    }),
  )
}
