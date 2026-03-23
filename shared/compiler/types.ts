/** JSON-serializable version of SceneStep (Blob replaced with data URI string) */
export interface SerializedStep {
  id: string
  order: number
  type: string
  screenshotUri: string // data:image/jpeg;base64,...
  clickTarget?: { x: number; y: number; selector: string; label: string }
  annotation?: { title: string; body: string; position: { x: number; y: number } }
  duration: number
  transition: string
  url?: string
}

export interface CompiledProject {
  title: string
  steps: SerializedStep[]
  compiledAt: string
}
