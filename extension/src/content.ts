import { getUniqueSelector, getElementLabel } from './capture/selectors'
import type { CapturedStep, Message } from './types'

// ── Import bridge (always runs, even on re-injection) ──

async function forwardPendingSession() {
  for (let i = 0; i < 5; i++) {
    try {
      const result = await chrome.storage.local.get('pendingSession')
      if (result.pendingSession) {
        window.postMessage(
          { type: 'LUCID_CAPTURE_IMPORT', session: result.pendingSession },
          '*',
        )
        await chrome.storage.local.remove('pendingSession')
        return
      }
    } catch {
      // Storage not available
    }
    await new Promise((r) => setTimeout(r, 500))
  }
}

if (window.location.href.includes('/editor/import')) {
  forwardPendingSession()
}

// ── Guard against double-injection ──
// If already injected, the message listener + event handlers from the
// first injection are still active. Skip re-registration.
const win = window as unknown as Window & { __lucidCaptureInjected?: boolean }
if (!win.__lucidCaptureInjected) {
win.__lucidCaptureInjected = true

let recording = false
let stepCount = 0
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null
let lastScrollY = 0

const SCROLL_DEBOUNCE_MS = 500
const MIN_SCROLL_DELTA = 100

// ── Message handler ──

chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse: (resp: unknown) => void) => {
    if (msg.type === 'START_RECORDING') {
      startCapture()
      sendResponse({ ok: true })
    } else if (msg.type === 'STOP_RECORDING') {
      stopCapture()
      sendResponse({ ok: true })
    } else if (msg.type === 'PING') {
      sendResponse({ ok: true, recording })
    }
    return true
  },
)

// ── Capture lifecycle ──

function startCapture() {
  recording = true
  stepCount = 0
  lastScrollY = window.scrollY

  document.addEventListener('click', handleClick, true)
  document.addEventListener('scroll', handleScroll, true)

  // Periodic capture is handled by the background service worker
  // Content script only handles user interaction events (clicks, scrolls)

  showRecordingIndicator()
}

function stopCapture() {
  recording = false

  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('scroll', handleScroll, true)
  navObserver.disconnect()

  if (scrollDebounceTimer) { clearTimeout(scrollDebounceTimer); scrollDebounceTimer = null }

  // Allow re-injection after full cleanup
  win.__lucidCaptureInjected = false

  removeRecordingIndicator()
}

// ── Event handlers ──

function handleClick(event: MouseEvent) {
  if (!recording) return

  const el = event.target as Element
  if ((el as HTMLElement).closest?.('[data-lucid-capture]')) return

  const x = event.clientX / window.innerWidth
  const y = event.clientY / window.innerHeight

  stepCount++
  showClickRipple(event.clientX, event.clientY, stepCount)

  const step: CapturedStep = {
    id: crypto.randomUUID(),
    type: 'click',
    timestamp: Date.now(),
    url: window.location.href,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
    clickTarget: {
      x, y,
      selector: getUniqueSelector(el),
      label: getElementLabel(el),
    },
  }

  chrome.runtime.sendMessage({ type: 'STEP_CAPTURED', step })
}

function handleScroll() {
  if (!recording) return

  // Debounce — wait for scroll to settle
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)

  scrollDebounceTimer = setTimeout(() => {
    const delta = Math.abs(window.scrollY - lastScrollY)
    if (delta >= MIN_SCROLL_DELTA) {
      lastScrollY = window.scrollY
      emitStep('scroll')
    }
  }, SCROLL_DEBOUNCE_MS)
}

function emitStep(type: 'scroll' | 'periodic' | 'navigation') {
  if (!recording) return

  stepCount++
  lastCaptureTime = Date.now()

  const step: CapturedStep = {
    id: crypto.randomUUID(),
    type,
    timestamp: Date.now(),
    url: window.location.href,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
  }

  chrome.runtime.sendMessage({ type: 'STEP_CAPTURED', step })
}

// Detect page navigation (SPA or full reload)
let lastUrl = window.location.href
const navObserver = new MutationObserver(() => {
  if (!recording) return
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href
    // Small delay to let the new page render
    setTimeout(() => emitStep('navigation'), 300)
  }
})
navObserver.observe(document.body, { childList: true, subtree: true })

// ── Visual Feedback ──

function showClickRipple(clientX: number, clientY: number, count: number) {
  const ripple = document.createElement('div')
  ripple.setAttribute('data-lucid-capture', 'ripple')
  Object.assign(ripple.style, {
    position: 'fixed',
    left: `${clientX}px`,
    top: `${clientY}px`,
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: 'rgba(33, 66, 231, 0.3)',
    border: '2px solid rgba(33, 66, 231, 0.7)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: '2147483646',
    transition: 'all 0.4s ease-out',
  })
  document.body.appendChild(ripple)

  const badge = document.createElement('div')
  badge.setAttribute('data-lucid-capture', 'badge')
  badge.textContent = String(count)
  Object.assign(badge.style, {
    position: 'fixed',
    left: `${clientX + 16}px`,
    top: `${clientY - 16}px`,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#2142e7',
    color: 'white',
    fontSize: '11px',
    fontWeight: '800',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: '2147483647',
    opacity: '0',
    transform: 'scale(0.5)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  })
  document.body.appendChild(badge)

  requestAnimationFrame(() => {
    ripple.style.width = '40px'
    ripple.style.height = '40px'
    badge.style.opacity = '1'
    badge.style.transform = 'scale(1)'
  })

  setTimeout(() => {
    ripple.style.opacity = '0'
    ripple.style.width = '60px'
    ripple.style.height = '60px'
    setTimeout(() => ripple.remove(), 400)
  }, 300)

  setTimeout(() => {
    badge.style.opacity = '0'
    badge.style.transform = 'scale(0.5)'
    setTimeout(() => badge.remove(), 300)
  }, 1500)
}

function showRecordingIndicator() {
  removeRecordingIndicator()

  const indicator = document.createElement('div')
  indicator.id = 'lucid-capture-indicator'
  indicator.setAttribute('data-lucid-capture', 'indicator')
  Object.assign(indicator.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    padding: '8px 16px',
    borderRadius: '9999px',
    background: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: '2147483647',
    pointerEvents: 'none',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  })

  const dot = document.createElement('div')
  Object.assign(dot.style, {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ff4444',
    animation: 'lucid-pulse 1s infinite',
  })

  const style = document.createElement('style')
  style.setAttribute('data-lucid-capture', 'styles')
  style.textContent = `
    @keyframes lucid-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `
  document.head.appendChild(style)

  const label = document.createElement('span')
  label.textContent = 'Lucid Capture Recording'

  indicator.appendChild(dot)
  indicator.appendChild(label)
  document.body.appendChild(indicator)
}

function removeRecordingIndicator() {
  document.getElementById('lucid-capture-indicator')?.remove()
  document.querySelector('[data-lucid-capture="styles"]')?.remove()
  document.querySelectorAll('[data-lucid-capture]').forEach(el => el.remove())
}

} // end of if (!__lucidCaptureInjected)
