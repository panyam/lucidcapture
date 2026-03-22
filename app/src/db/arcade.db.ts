import Dexie from 'dexie'
import { db } from './schema'
import type { ArcadeProject, ArcadeStep } from '../types/arcade'

function now() {
  return new Date().toISOString()
}

// ── Projects ──

export async function listProjects(): Promise<ArcadeProject[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function getProject(id: string): Promise<ArcadeProject | undefined> {
  return db.projects.get(id)
}

export async function createProject(title: string): Promise<ArcadeProject> {
  const project: ArcadeProject = {
    id: crypto.randomUUID(),
    title,
    createdAt: now(),
    updatedAt: now(),
    stepCount: 0,
    totalDuration: 0,
    privacy: 'public',
  }
  await db.projects.add(project)
  return project
}

export async function updateProject(id: string, updates: Partial<ArcadeProject>): Promise<void> {
  await db.projects.update(id, { ...updates, updatedAt: now() })
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.projects, db.steps, async () => {
    await db.steps.where('projectId').equals(id).delete()
    await db.projects.delete(id)
  })
}

// ── Steps ──

export async function getSteps(projectId: string): Promise<ArcadeStep[]> {
  return db.steps.where('[projectId+order]').between([projectId, Dexie.minKey], [projectId, Dexie.maxKey]).toArray()
}

export async function addStep(step: ArcadeStep): Promise<void> {
  await db.transaction('rw', db.projects, db.steps, async () => {
    await db.steps.add(step)
    const count = await db.steps.where('projectId').equals(step.projectId).count()
    await db.projects.update(step.projectId, {
      stepCount: count,
      updatedAt: now(),
    })
  })
}

export async function updateStep(id: string, updates: Partial<ArcadeStep>): Promise<void> {
  await db.steps.update(id, updates)
}

export async function deleteStep(id: string, projectId: string): Promise<void> {
  await db.transaction('rw', db.projects, db.steps, async () => {
    await db.steps.delete(id)
    const count = await db.steps.where('projectId').equals(projectId).count()
    await db.projects.update(projectId, {
      stepCount: count,
      updatedAt: now(),
    })
  })
}

export { Dexie, db }
