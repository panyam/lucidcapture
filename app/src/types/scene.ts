export interface SceneProject {
  id: string
  title: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  thumbnail?: Blob
  stepCount: number
  totalDuration: number // ms
  privacy: 'public' | 'private' | 'passcode'
}

export type StepType = 'click' | 'scroll' | 'input' | 'periodic' | 'navigation'
export type StepTransition = 'fade' | 'slide' | 'none'

export interface ClickTarget {
  x: number // viewport ratio 0-1
  y: number // viewport ratio 0-1
  selector: string // CSS selector of clicked element
  label: string // descriptive label (textContent or aria-label)
}

export interface StepAnnotation {
  title: string
  body: string
  position: { x: number; y: number } // viewport ratios
}

export interface SceneStep {
  id: string
  projectId: string
  order: number
  type: StepType
  screenshot: Blob
  videoClip?: Blob
  clickTarget?: ClickTarget
  annotation?: StepAnnotation
  duration: number // ms
  transition: StepTransition
  url?: string // page URL at this step
  viewportWidth?: number
  viewportHeight?: number
}
