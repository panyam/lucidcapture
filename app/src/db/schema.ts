import Dexie, { type EntityTable } from 'dexie'
import type { SceneProject, SceneStep } from '../types/scene'

export const db = new Dexie('lucid-capture') as Dexie & {
  projects: EntityTable<SceneProject, 'id'>
  steps: EntityTable<SceneStep, 'id'>
}

db.version(1).stores({
  projects: 'id, updatedAt, title',
  steps: 'id, projectId, [projectId+order]',
})
