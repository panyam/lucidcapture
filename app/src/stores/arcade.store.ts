import { create } from 'zustand'
import type { ArcadeProject, ArcadeStep } from '../types/arcade'
import * as arcadeDb from '../db/arcade.db'

interface ArcadeState {
  projects: ArcadeProject[]
  currentProject: ArcadeProject | null
  currentSteps: ArcadeStep[]
  loading: boolean

  // Actions
  loadProjects: () => Promise<void>
  loadProject: (id: string) => Promise<void>
  createProject: (title: string) => Promise<ArcadeProject>
  deleteProject: (id: string) => Promise<void>
  updateProject: (id: string, updates: Partial<ArcadeProject>) => Promise<void>
  addStep: (step: ArcadeStep) => Promise<void>
  updateStep: (id: string, updates: Partial<ArcadeStep>) => Promise<void>
  deleteStep: (id: string) => Promise<void>
}

export const useArcadeStore = create<ArcadeState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentSteps: [],
  loading: false,

  loadProjects: async () => {
    set({ loading: true })
    const projects = await arcadeDb.listProjects()
    set({ projects, loading: false })
  },

  loadProject: async (id: string) => {
    set({ loading: true })
    const [project, steps] = await Promise.all([
      arcadeDb.getProject(id),
      arcadeDb.getSteps(id),
    ])
    set({
      currentProject: project ?? null,
      currentSteps: steps,
      loading: false,
    })
  },

  createProject: async (title: string) => {
    const project = await arcadeDb.createProject(title)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  deleteProject: async (id: string) => {
    await arcadeDb.deleteProject(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
      currentSteps: s.currentProject?.id === id ? [] : s.currentSteps,
    }))
  },

  updateProject: async (id: string, updates: Partial<ArcadeProject>) => {
    await arcadeDb.updateProject(id, updates)
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentProject: s.currentProject?.id === id ? { ...s.currentProject, ...updates } : s.currentProject,
    }))
  },

  addStep: async (step: ArcadeStep) => {
    await arcadeDb.addStep(step)
    const { currentProject } = get()
    if (currentProject && step.projectId === currentProject.id) {
      set((s) => {
        const newSteps = [...s.currentSteps, step].sort((a, b) => a.order - b.order)
        return {
          currentSteps: newSteps,
          currentProject: s.currentProject
            ? {
                ...s.currentProject,
                stepCount: newSteps.length,
                totalDuration: newSteps.reduce((sum, s) => sum + (s.duration || 0), 0),
              }
            : null,
        }
      })
    }
  },

  updateStep: async (id: string, updates: Partial<ArcadeStep>) => {
    await arcadeDb.updateStep(id, updates)
    set((s) => ({
      currentSteps: s.currentSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step,
      ),
    }))
  },

  deleteStep: async (id: string) => {
    const { currentSteps } = get()
    const step = currentSteps.find((s) => s.id === id)
    if (!step) return
    await arcadeDb.deleteStep(id, step.projectId)
    set((s) => {
      const newSteps = s.currentSteps.filter((s) => s.id !== id)
      return {
        currentSteps: newSteps,
        currentProject:
          s.currentProject?.id === step.projectId
            ? {
                ...s.currentProject,
                stepCount: newSteps.length,
                totalDuration: newSteps.reduce((sum, s) => sum + (s.duration || 0), 0),
              }
            : s.currentProject,
      }
    })
  },
}))
