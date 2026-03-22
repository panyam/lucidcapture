import type { RecordingSession, CapturedStep, Message, StateResponse } from './types'

let session: RecordingSession | null = null
let injectedTabs = new Set<number>()

// Expose for Playwright testing
;(globalThis as any).__lucid = {
  startRecording: () => startRecording(),
  stopRecording: () => stopRecording(),
  getSession: () => session,
}

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

// ── Cross-tab recording ──
// When the user switches tabs during recording, inject the content script
// into the new active tab so we capture events there too.

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!session || session.state !== 'recording') return
  await ensureContentScript(activeInfo.tabId)
})

// Also handle new windows
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (!session || session.state !== 'recording') return
  if (windowId === chrome.windows.WINDOW_ID_NONE) return
  const [tab] = await chrome.tabs.query({ active: true, windowId })
  if (tab?.id) {
    await ensureContentScript(tab.id)
  }
})

async function ensureContentScript(tabId: number) {
  if (injectedTabs.has(tabId)) {
    // Already injected — just make sure it's recording
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
    } catch {
      // Tab may have navigated — re-inject
      injectedTabs.delete(tabId)
      await injectAndStart(tabId)
    }
    return
  }
  await injectAndStart(tabId)
}

async function injectAndStart(tabId: number) {
  try {
    // Skip chrome:// and extension pages
    const tab = await chrome.tabs.get(tabId)
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['dist/content.js'],
    })
    injectedTabs.add(tabId)
    await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
  } catch (err) {
    console.warn(`Failed to inject content script into tab ${tabId}:`, err)
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

  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    tabId = tab?.id
  }

  if (tabId) {
    await injectAndStart(tabId)
  }

  chrome.action.setBadgeText({ text: 'REC' })
  chrome.action.setBadgeBackgroundColor({ color: '#ba1a1a' })
}

async function handleStep(step: CapturedStep) {
  if (!session || session.state !== 'recording') return

  // Take screenshot of the currently active tab (not necessarily the tab that sent the event)
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null as unknown as number, {
      format: 'jpeg',
      quality: 70,
    })
    step.screenshot = dataUrl
  } catch (err) {
    console.warn('Screenshot capture failed:', err)
  }

  session.steps.push(step)
  chrome.action.setBadgeText({ text: String(session.steps.length) })
}

async function stopRecording() {
  if (!session) return
  session.state = 'idle'

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

  chrome.tabs.create({ url: 'http://localhost:5173/editor/import' })
}
