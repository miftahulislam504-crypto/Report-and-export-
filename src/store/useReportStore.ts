import { create } from 'zustand'
import type { Report } from '@/lib/types'
import {
  getCollection,
  createDocument,
  updateDocument,
  Collections,
  where,
  orderBy,
} from '@/firebase/firestore'

interface ReportState {
  reports: Report[]
  currentReport: Report | null
  loading: boolean
  error: string | null

  fetchReports: (projectId: string) => Promise<void>
  createReport: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateReport: (id: string, data: Partial<Report>) => Promise<void>
  setCurrentReport: (report: Report | null) => void
  clearError: () => void
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  loading: false,
  error: null,

  fetchReports: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const reports = await getCollection<Report>(Collections.REPORTS, [
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc'),
      ])
      set({ reports })
    } catch (err) {
      set({ error: 'Failed to load reports' })
    } finally {
      set({ loading: false })
    }
  },

  createReport: async (data) => {
    set({ loading: true, error: null })
    try {
      const id = await createDocument(Collections.REPORTS, data)
      if (data.projectId) await get().fetchReports(data.projectId)
      return id
    } catch (err) {
      set({ error: 'Failed to create report' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  updateReport: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await updateDocument(Collections.REPORTS, id, data)
      set((s) => ({
        reports: s.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
      }))
    } catch (err) {
      set({ error: 'Failed to update report' })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentReport: (report) => set({ currentReport: report }),
  clearError: () => set({ error: null }),
}))
