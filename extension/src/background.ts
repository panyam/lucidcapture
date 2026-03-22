import type { RecordingSession, CapturedStep, Message, StateResponse } from './types'

let session: RecordingSession | null = null
let injectedTabs = new Set<number>()
let periodicTimer: ReturnType<typeof setInterval> | null = null
let lastCaptureTime = 0

const PERIODIC_INTERVAL_MS = 2000

// Expose for Playwright testing
;(globalThis as any).__lucid = {
  startRecording: () => startRecording(),
  stopRecording: () => stopRecording(),
  getSession: () => session,
}

// ── Message handling ──

chrome.runtime.onMessage.addListener(
  (msg: Message, sender, sendResponse: (resp: unknown) => void) => {
    if (msg.type === 'START_RECORDING') {
      startRecording(sender.tab?.id)
      sendResponse({ ok: true })
    } else if (msg.type === 'STOP_RECORDING') {
      stopRecording()
      sendResponse({ ok: true })
    } else if (msg.type === 'GET_STATE') {
      const resp: StateResponse = {
        state: session?.state ?? 'idle',
        stepCount: session?.steps.length ?? 0,
      }
      sendResponse(resp)
    } else if (msg.type === 'STEP_CAPTURED') {
      handleStep(msg.step)
    }
    return true
  },
)

// ── Cross-tab tracking ──
// The background is the controller — it survives tab/page changes.
// Content scripts only capture user interactions (clicks, scrolls).
// The background handles periodic screenshots and tab lifecycle.

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('[lucid] Tab activated:', activeInfo.tabId, 'recording:', session?.state)
  if (!session || session.state !== 'recording') return
  await ensureContentScript(activeInfo.tabId)
  capturePeriodicStep('navigation')
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  console.log('[lucid] Window focus changed:', windowId, 'recording:', session?.state)
  if (!session || session.state !== 'recording') return
  if (windowId === chrome.windows.WINDOW_ID_NONE) return
  const [tab] = await chrome.tabs.query({ active: true, windowId })
  if (tab?.id) {
    console.log('[lucid] Active tab in new window:', tab.id, tab.url)
    await ensureContentScript(tab.id)
    capturePeriodicStep('navigation')
  }
})

// Detect URL changes within a tab (SPA navigation or full page load)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!session || session.state !== 'recording') return

  // Handle both URL changes and page load completion
  if (changeInfo.url) {
    console.log('[lucid] Tab URL changed:', tabId, changeInfo.url)
  }
  if (changeInfo.status === 'complete') {
    console.log('[lucid] Tab load complete:', tabId, tab.url)
  }

  if (!changeInfo.url && changeInfo.status !== 'complete') return

  // Only care about the active tab
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (activeTab?.id !== tabId) return

  // Re-inject content script (page navigated, old script is dead)
  injectedTabs.delete(tabId)
  // Wait for page to settle before injecting
  setTimeout(() => {
    if (session?.state === 'recording') {
      injectAndStart(tabId)
      capturePeriodicStep('navigation')
    }
  }, 500)
})

// ── Content script injection ──

async function ensureContentScript(tabId: number) {
  // Try to ping existing content script
  if (injectedTabs.has(tabId)) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
      return
    } catch {
      // Content script died (page navigated) — re-inject
      injectedTabs.delete(tabId)
    }
  }
  await injectAndStart(tabId)
}

async function injectAndStart(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('edge://')) return

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['dist/content.js'],
    })
    injectedTabs.add(tabId)
    await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
  } catch (err) {
    console.warn(`[lucid] Failed to inject into tab ${tabId}:`, err)
  }
}

// ── Recording lifecycle ──

async function startRecording(tabId?: number) {
  session = {
    id: crypto.randomUUID(),
    state: 'recording',
    steps: [],
    startedAt: Date.now(),
  }
  injectedTabs.clear()
  lastCaptureTime = Date.now()

  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    tabId = tab?.id
  }

  if (tabId) {
    await injectAndStart(tabId)
  }

  // Background-driven periodic capture — survives tab/page changes
  periodicTimer = setInterval(() => {
    if (!session || session.state !== 'recording') return
    // Skip if we captured recently (click/scroll/navigation just happened)
    if (Date.now() - lastCaptureTime < 1500) return
    capturePeriodicStep('periodic')
  }, PERIODIC_INTERVAL_MS)

  chrome.action.setBadgeText({ text: 'REC' })
  chrome.action.setBadgeBackgroundColor({ color: '#ba1a1a' })
}

async function capturePeriodicStep(type: 'periodic' | 'navigation') {
  if (!session || session.state !== 'recording') return

  // Get active tab info for URL and viewport
  let url = ''
  let viewportWidth = 0
  let viewportHeight = 0
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    url = tab?.url ?? ''
    viewportWidth = tab?.width ?? 0
    viewportHeight = tab?.height ?? 0
  } catch { /* no active tab */ }

  const step: CapturedStep = {
    id: crypto.randomUUID(),
    type,
    timestamp: Date.now(),
    url,
    viewportWidth,
    viewportHeight,
  }

  // Take screenshot
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null as unknown as number, {
      format: 'jpeg',
      quality: 70,
    })
    step.screenshot = dataUrl
  } catch (err) {
    console.warn('[lucid] Periodic screenshot failed:', err)
    return // Don't add a step with no screenshot
  }

  lastCaptureTime = Date.now()
  session.steps.push(step)
  chrome.action.setBadgeText({ text: String(session.steps.length) })
}

async function handleStep(step: CapturedStep) {
  if (!session || session.state !== 'recording') return

  // Take screenshot of the currently visible tab
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null as unknown as number, {
      format: 'jpeg',
      quality: 70,
    })
    step.screenshot = dataUrl
  } catch (err) {
    console.warn('[lucid] Screenshot capture failed:', err)
  }

  lastCaptureTime = Date.now()
  session.steps.push(step)
  chrome.action.setBadgeText({ text: String(session.steps.length) })
}

async function stopRecording() {
  if (!session) return
  session.state = 'idle'

  // Stop periodic capture
  if (periodicTimer) { clearInterval(periodicTimer); periodicTimer = null }

  // Tell all injected tabs to stop
  for (const tabId of injectedTabs) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'STOP_RECORDING' })
    } catch {
      // Tab may have closed or navigated
    }
  }
  injectedTabs.clear()

  // Store for the React app
  await chrome.storage.local.set({
    pendingSession: {
      id: session.id,
      steps: session.steps,
      capturedAt: Date.now(),
    },
  })

  chrome.action.setBadgeText({ text: '' })
  session = null

  // Use the app URL — defaults to localhost for dev, override for production
  const APP_URL = 'http://localhost:5173'
  chrome.tabs.create({ url: `${APP_URL}/editor/import` })
}
