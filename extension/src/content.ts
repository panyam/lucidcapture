import { getUniqueSelector, getElementLabel } from './capture/selectors'
import type { CapturedStep, Message } from './types'

let recording = false

chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse: (resp: unknown) => void) => {
    if (msg.type === 'START_RECORDING') {
      recording = true
      document.addEventListener('click', handleClick, true)
      sendResponse({ ok: true })
    } else if (msg.type === 'STOP_RECORDING') {
      recording = false
      document.removeEventListener('click', handleClick, true)
      sendResponse({ ok: true })
    } else if (msg.type === 'PING') {
      sendResponse({ ok: true, recording })
    }
    return true
  },
)

function handleClick(event: MouseEvent) {
  if (!recording) return

  const el = event.target as Element
  const x = event.clientX / window.innerWidth
  const y = event.clientY / window.innerHeight

  const step: CapturedStep = {
    id: crypto.randomUUID(),
    type: 'click',
    timestamp: Date.now(),
    url: window.location.href,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    clickTarget: {
      x,
      y,
      selector: getUniqueSelector(el),
      label: getElementLabel(el),
    },
  }

  chrome.runtime.sendMessage({ type: 'STEP_CAPTURED', step })
}
