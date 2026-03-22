export type RecordingState = 'idle' | 'recording' | 'paused'

export interface ClickTarget {
  x: number // viewport ratio 0-1
  y: number // viewport ratio 0-1
  selector: string
  label: string
}

export interface CapturedStep {
  id: string
  type: 'click' | 'scroll' | 'input'
  timestamp: number
  url: string
  viewportWidth: number
  viewportHeight: number
  screenshot?: string // base64 data URI (filled by background)
  clickTarget?: ClickTarget
}

export interface RecordingSession {
  id: string
  state: RecordingState
  steps: CapturedStep[]
  startedAt: number
}

// Messages between content script, background, and popup
export type Message =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'PING' }
  | { type: 'GET_STATE' }
  | { type: 'STEP_CAPTURED'; step: CapturedStep }

export interface StateResponse {
  state: RecordingState
  stepCount: number
}
