import { create } from 'zustand'
import type { SceneProject, SceneStep } from '../types/scene'
import * as sceneDb from '../db/scene.db'

interface SceneState {
  projects: SceneProject[]
  currentProject: SceneProject | null
  currentSteps: SceneStep[]
  loading: boolean

  // Actions
  loadProjects: () => Promise<void>
  loadProject: (id: string) => Promise<void>
  createProject: (title: string) => Promise<SceneProject>
  deleteProject: (id: string) => Promise<void>
  updateProject: (id: string, updates: Partial<SceneProject>) => Promise<void>
  addStep: (step: SceneStep) => Promise<void>
  updateStep: (id: string, updates: Partial<SceneStep>) => Promise<void>
  deleteStep: (id: string) => Promise<void>
}

export const useSceneStore = create<SceneState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentSteps: [],
  loading: false,

  loadProjects: async () => {
    set({ loading: true })
    const projects = await sceneDb.listProjects()
    set({ projects, loading: false })
  },

  loadProject: async (id: string) => {
    set({ loading: true })
    const [project, steps] = await Promise.all([
      sceneDb.getProject(id),
      sceneDb.getSteps(id),
    ])
    set({
      currentProject: project ?? null,
      currentSteps: steps,
      loading: false,
    })
  },

  createProject: async (title: string) => {
    const project = await sceneDb.createProject(title)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  deleteProject: async (id: string) => {
    await sceneDb.deleteProject(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
      currentSteps: s.currentProject?.id === id ? [] : s.currentSteps,
    }))
  },

  updateProject: async (id: string, updates: Partial<SceneProject>) => {
    await sceneDb.updateProject(id, updates)
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentProject: s.currentProject?.id === id ? { ...s.currentProject, ...updates } : s.currentProject,
    }))
  },

  addStep: async (step: SceneStep) => {
    await sceneDb.addStep(step)
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

  updateStep: async (id: string, updates: Partial<SceneStep>) => {
    await sceneDb.updateStep(id, updates)
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
    await sceneDb.deleteStep(id, step.projectId)
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
