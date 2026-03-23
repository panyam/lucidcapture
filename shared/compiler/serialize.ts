import type { SerializedStep } from './types'

/** Minimal SceneStep shape — only the fields we need for serialization */
interface StepLike {
  id: string
  order: number
  type: string
  screenshot: Blob
  clickTarget?: { x: number; y: number; selector: string; label: string }
  annotation?: { title: string; body: string; position: { x: number; y: number } }
  duration: number
  transition: string
  url?: string
}

/** Convert a Blob to a data URI string (e.g., data:image/jpeg;base64,...) */
export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** Convert steps with Blob screenshots to SerializedSteps with data URI strings */
export async function serializeSteps(steps: StepLike[]): Promise<SerializedStep[]> {
  return Promise.all(
    steps.map(async (step) => ({
      id: step.id,
      order: step.order,
      type: step.type,
      screenshotUri: await blobToDataUri(step.screenshot),
      clickTarget: step.clickTarget,
      annotation: step.annotation,
      duration: step.duration,
      transition: step.transition,
      url: step.url,
    })),
  )
}
