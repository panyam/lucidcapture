import Dexie, { type EntityTable } from 'dexie'

/** Matches the React app's SceneProject/SceneStep types */
interface Project {
  id: string
  title: string
  stepCount: number
}

interface Step {
  id: string
  projectId: string
  order: number
  type: string
  screenshot: Blob
  clickTarget?: { x: number; y: number; selector: string; label: string }
  annotation?: { title: string; body: string; position: { x: number; y: number } }
  duration: number
  transition: string
  url?: string
}

const db = new Dexie('lucid-capture') as Dexie & {
  projects: EntityTable<Project, 'id'>
  steps: EntityTable<Step, 'id'>
}

db.version(1).stores({
  projects: 'id, updatedAt, title',
  steps: 'id, projectId, [projectId+order]',
})

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

export async function getSteps(projectId: string): Promise<Step[]> {
  return db.steps.where('[projectId+order]').between([projectId, Dexie.minKey], [projectId, Dexie.maxKey]).toArray()
}

export { db }
export type { Project, Step }
