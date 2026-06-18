import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectStats } from '@/lib/types'
import {
  getCollection,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  Collections,
  where,
  orderBy,
} from '@/firebase/firestore'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  currentStats: ProjectStats | null
  loading: boolean
  error: string | null

  fetchProjects: (userId: string) => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  setCurrentStats: (stats: ProjectStats) => void
  clearError: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentStats: null,
      loading: false,
      error: null,

      fetchProjects: async (userId) => {
        set({ loading: true, error: null })
        try {
          const projects = await getCollection<Project>(Collections.PROJECTS, [
            where('createdBy', '==', userId),
            orderBy('createdAt', 'desc'),
          ])
          set((s) => {
            // If currentProject exists, keep it updated from fresh list
            // If no currentProject but projects exist, auto-select the first one
            const updated = projects.find((p) => p.id === s.currentProject?.id) ?? null
            const autoSelect = !s.currentProject && projects.length > 0 ? projects[0] : null
            return {
              projects,
              currentProject: updated ?? autoSelect ?? s.currentProject,
            }
          })
        } catch (err) {
          set({ error: 'Failed to load projects' })
        } finally {
          set({ loading: false })
        }
      },

      fetchProject: async (id) => {
        set({ loading: true, error: null })
        try {
          const project = await getDocument<Project>(Collections.PROJECTS, id)
          set({ currentProject: project })
        } catch (err) {
          set({ error: 'Failed to load project' })
        } finally {
          set({ loading: false })
        }
      },

      createProject: async (data) => {
        set({ loading: true, error: null })
        try {
          const id = await createDocument(Collections.PROJECTS, data)
          // Fetch updated list
          await get().fetchProjects(data.createdBy ?? data.ownerId)
          // Auto-select the newly created project
          const newProject = await getDocument<Project>(Collections.PROJECTS, id)
          if (newProject) set({ currentProject: newProject })
          return id
        } catch (err) {
          set({ error: 'Failed to create project' })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      updateProject: async (id, data) => {
        set({ loading: true, error: null })
        try {
          await updateDocument(Collections.PROJECTS, id, data)
          const updated = await getDocument<Project>(Collections.PROJECTS, id)
          set({ currentProject: updated })
          // Refresh list too
          const { projects } = get()
          if (projects.length > 0) {
            set((s) => ({
              projects: s.projects.map((p) => (p.id === id ? (updated ?? p) : p)),
            }))
          }
        } catch (err) {
          set({ error: 'Failed to update project' })
        } finally {
          set({ loading: false })
        }
      },

      deleteProject: async (id) => {
        set({ loading: true, error: null })
        try {
          await deleteDocument(Collections.PROJECTS, id)
          set((s) => {
            const remaining = s.projects.filter((p) => p.id !== id)
            return {
              projects: remaining,
              // If deleted project was active, auto-select first remaining
              currentProject:
                s.currentProject?.id === id
                  ? remaining[0] ?? null
                  : s.currentProject,
            }
          })
        } catch (err) {
          set({ error: 'Failed to delete project' })
        } finally {
          set({ loading: false })
        }
      },

      setCurrentProject: (project) => set({ currentProject: project }),
      setCurrentStats: (stats) => set({ currentStats: stats }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'civilos-project-store',
      // Only persist currentProject id — re-fetch data on load
      partialize: (state) => ({
        currentProject: state.currentProject,
      }),
    }
  )
)
