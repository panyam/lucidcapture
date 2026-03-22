import type { RecordingSession, CapturedStep, Message, StateResponse } from './types'

let session: RecordingSession | null = null

// Expose for Playwright testing — service worker evaluate() can call these
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
      handleStep(msg.step, sender.tab?.id)
    }
    return true
  },
)

async function startRecording(tabId?: number) {
  session = {
    id: crypto.randomUUID(),
    state: 'recording',
    steps: [],
    startedAt: Date.now(),
  }

  // If no tabId provided (e.g. message came from popup), query the active tab
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    tabId = tab?.id
  }

  if (tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
    } catch {
      // Content script not injected — inject it first
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['dist/content.js'],
      })
      await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING' })
    }
  }

  chrome.action.setBadgeText({ text: 'REC' })
  chrome.action.setBadgeBackgroundColor({ color: '#ba1a1a' })
}

async function handleStep(step: CapturedStep, _tabId?: number) {
  if (!session || session.state !== 'recording') return

  // Take screenshot
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

  // Tell content script to stop
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'STOP_RECORDING' })
    } catch {
      // Tab may have navigated
    }
  }

  // Store for the React app to pick up
  await chrome.storage.local.set({
    pendingSession: {
      id: session.id,
      steps: session.steps,
      capturedAt: Date.now(),
    },
  })

  chrome.action.setBadgeText({ text: '' })

  // Save to storage — the content script on the editor page will read it
  session = null

  // Open the editor import page
  // The content script (injected via <all_urls>) will detect this URL
  // and forward the pendingSession from chrome.storage.local via postMessage
  chrome.tabs.create({ url: 'http://localhost:5173/editor/import' })
}
