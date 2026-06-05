import { create } from 'zustand'
import type { ReportTemplate } from '@/lib/types'
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
import { DEFAULT_TEMPLATES } from '@/templates/defaultTemplates'

interface TemplateState {
  templates: ReportTemplate[]
  currentTemplate: ReportTemplate | null
  loading: boolean
  error: string | null

  fetchTemplates: (userId: string) => Promise<void>
  createTemplate: (data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateTemplate: (id: string, data: Partial<ReportTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  seedDefaultTemplates: (userId: string) => Promise<void>
  setCurrentTemplate: (t: ReportTemplate | null) => void
  clearError: () => void
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,

  fetchTemplates: async (userId) => {
    set({ loading: true, error: null })
    try {
      const templates = await getCollection<ReportTemplate>(Collections.TEMPLATES, [
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc'),
      ])
      set({ templates })
    } catch {
      set({ error: 'Failed to load templates' })
    } finally {
      set({ loading: false })
    }
  },

  createTemplate: async (data) => {
    set({ loading: true, error: null })
    try {
      const id = await createDocument(Collections.TEMPLATES, data)
      return id
    } catch {
      set({ error: 'Failed to create template' })
      throw new Error('Create failed')
    } finally {
      set({ loading: false })
    }
  },

  updateTemplate: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await updateDocument(Collections.TEMPLATES, id, data)
      set((s) => ({
        templates: s.templates.map((t) => (t.id === id ? { ...t, ...data } : t)),
        currentTemplate: s.currentTemplate?.id === id ? { ...s.currentTemplate, ...data } : s.currentTemplate,
      }))
    } catch {
      set({ error: 'Failed to update template' })
    } finally {
      set({ loading: false })
    }
  },

  deleteTemplate: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteDocument(Collections.TEMPLATES, id)
      set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
    } catch {
      set({ error: 'Failed to delete template' })
    } finally {
      set({ loading: false })
    }
  },

  seedDefaultTemplates: async (userId) => {
    const existing = get().templates
    if (existing.length > 0) return // already seeded

    set({ loading: true })
    try {
      for (const tpl of DEFAULT_TEMPLATES) {
        await createDocument(Collections.TEMPLATES, { ...tpl, ownerId: userId })
      }
      await get().fetchTemplates(userId)
    } catch {
      set({ error: 'Failed to seed templates' })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentTemplate: (t) => set({ currentTemplate: t }),
  clearError: () => set({ error: null }),
}))
