import Dexie, { type EntityTable } from 'dexie'
import type { ArcadeProject, ArcadeStep } from '../types/arcade'

export const db = new Dexie('lucid-capture') as Dexie & {
  projects: EntityTable<ArcadeProject, 'id'>
  steps: EntityTable<ArcadeStep, 'id'>
}

db.version(1).stores({
  projects: 'id, updatedAt, title',
  steps: 'id, projectId, [projectId+order]',
})
