import { create } from 'zustand'
import type { ExportRecord, ExportFormat } from '@/lib/types'
import { createDocument, Collections } from '@/firebase/firestore'

export type ExportStatus = 'idle' | 'generating' | 'success' | 'error'

export interface ExportJob {
  id: string
  label: string
  format: ExportFormat
  status: ExportStatus
  progress: number  // 0-100
  error?: string
  fileUrl?: string
  startedAt: Date
}

interface ExportState {
  jobs: ExportJob[]
  history: ExportRecord[]

  addJob: (label: string, format: ExportFormat) => string
  updateJob: (id: string, patch: Partial<ExportJob>) => void
  removeJob: (id: string) => void
  clearCompleted: () => void
  saveToHistory: (record: Omit<ExportRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

export const useExportStore = create<ExportState>((set, get) => ({
  jobs: [],
  history: [],

  addJob: (label, format) => {
    const id = `job_${Date.now()}`
    const job: ExportJob = {
      id, label, format,
      status: 'generating',
      progress: 0,
      startedAt: new Date(),
    }
    set((s) => ({ jobs: [...s.jobs, job] }))
    return id
  },

  updateJob: (id, patch) => {
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }))
  },

  removeJob: (id) => {
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }))
  },

  clearCompleted: () => {
    set((s) => ({ jobs: s.jobs.filter((j) => j.status === 'generating') }))
  },

  saveToHistory: async (record) => {
    const id = await createDocument(Collections.EXPORTS, record)
    set((s) => ({
      history: [{ ...record, id } as ExportRecord, ...s.history],
    }))
  },
}))

// ─── Export helpers ───────────────────────────────────────────────

/** Download a Blob as a file */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Download a jsPDF instance */
export function downloadJsPDF(doc: import('jspdf').jsPDF, filename: string) {
  doc.save(filename)
}
