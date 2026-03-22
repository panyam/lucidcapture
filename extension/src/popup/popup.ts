import type { StateResponse } from '../types'

const statusDot = document.getElementById('statusDot') as HTMLDivElement
const statusText = document.getElementById('statusText') as HTMLSpanElement
const stepCount = document.getElementById('stepCount') as HTMLDivElement
const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement

let isRecording = false

// Get current state on popup open
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response: StateResponse) => {
  if (response) {
    updateUI(response.state === 'recording', response.stepCount)
  }
})

actionBtn.addEventListener('click', async () => {
  if (isRecording) {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
    updateUI(false, 0)
    window.close()
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.runtime.sendMessage({ type: 'START_RECORDING' })
      updateUI(true, 0)
      // Close popup so user can interact with the target page
      setTimeout(() => window.close(), 500)
    }
  }
})

function updateUI(recording: boolean, count: number) {
  isRecording = recording
  stepCount.textContent = String(count)

  if (recording) {
    statusDot.classList.add('recording')
    statusText.textContent = 'Recording...'
    actionBtn.textContent = 'Stop Recording'
    actionBtn.className = 'btn-stop'
  } else {
    statusDot.classList.remove('recording')
    statusText.textContent = 'Ready'
    actionBtn.textContent = 'Start Recording'
    actionBtn.className = 'btn-record'
  }
}
