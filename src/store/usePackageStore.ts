import { create } from 'zustand'
import type { DocumentPackage, PackageType, ReportStatus } from '@/lib/types'
import {
  getCollection, createDocument, updateDocument,
  deleteDocument, Collections, where, orderBy,
} from '@/firebase/firestore'

interface PackageState {
  packages: DocumentPackage[]
  currentPackage: DocumentPackage | null
  loading: boolean
  error: string | null

  fetchPackages: (projectId: string) => Promise<void>
  createPackage: (data: Omit<DocumentPackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updatePackage: (id: string, data: Partial<DocumentPackage>) => Promise<void>
  deletePackage: (id: string) => Promise<void>
  setCurrentPackage: (pkg: DocumentPackage | null) => void
  clearError: () => void
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  currentPackage: null,
  loading: false,
  error: null,

  fetchPackages: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const packages = await getCollection<DocumentPackage>(Collections.PACKAGES, [
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc'),
      ])
      set({ packages })
    } catch {
      set({ error: 'Failed to load packages' })
    } finally {
      set({ loading: false })
    }
  },

  createPackage: async (data) => {
    set({ loading: true, error: null })
    try {
      const id = await createDocument(Collections.PACKAGES, data)
      if (data.projectId) await get().fetchPackages(data.projectId)
      return id
    } catch {
      set({ error: 'Failed to create package' })
      throw new Error('Create failed')
    } finally {
      set({ loading: false })
    }
  },

  updatePackage: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await updateDocument(Collections.PACKAGES, id, data)
      set((s) => ({
        packages: s.packages.map((p) => (p.id === id ? { ...p, ...data } : p)),
        currentPackage: s.currentPackage?.id === id
          ? { ...s.currentPackage, ...data }
          : s.currentPackage,
      }))
    } catch {
      set({ error: 'Failed to update package' })
    } finally {
      set({ loading: false })
    }
  },

  deletePackage: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteDocument(Collections.PACKAGES, id)
      set((s) => ({ packages: s.packages.filter((p) => p.id !== id) }))
    } catch {
      set({ error: 'Failed to delete package' })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentPackage: (pkg) => set({ currentPackage: pkg }),
  clearError: () => set({ error: null }),
}))
