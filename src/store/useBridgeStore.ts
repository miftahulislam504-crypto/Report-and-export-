import { create } from 'zustand'
import type { EcosystemData, SourceApp, SyncStatus } from '@/bridge/bridgeTypes'
import {
  fetchEcosystemData,
  subscribeToEcosystem,
  seedBridgeData,
  writeBridgeData,
} from '@/bridge/bridgeService'

interface BridgeState {
  ecosystem: EcosystemData | null
  loading: boolean
  seeding: boolean
  error: string | null
  unsubscribe: (() => void) | null

  fetchAll: (projectId: string) => Promise<void>
  subscribe: (projectId: string) => void
  unsubscribeAll: () => void
  seedDemo: (projectId: string, projectName: string) => Promise<void>
  updateSyncStatus: (app: SourceApp, status: SyncStatus) => void
  clearError: () => void
}

export const useBridgeStore = create<BridgeState>((set, get) => ({
  ecosystem: null,
  loading: false,
  seeding: false,
  error: null,
  unsubscribe: null,

  fetchAll: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const data = await fetchEcosystemData(projectId)
      set({ ecosystem: data })
    } catch {
      set({ error: 'Failed to fetch ecosystem data' })
    } finally {
      set({ loading: false })
    }
  },

  subscribe: (projectId) => {
    // Unsubscribe from any existing subscription
    get().unsubscribeAll()

    const unsub = subscribeToEcosystem(projectId, (app, data) => {
      set((s) => {
        if (!s.ecosystem) return s
        const appKey = app === 'project-management' ? 'projectManagement' : app
        return {
          ecosystem: {
            ...s.ecosystem,
            [appKey]: data,
            syncStatus: { ...s.ecosystem.syncStatus, [app]: 'synced' as SyncStatus },
            syncedAt:   { ...s.ecosystem.syncedAt,   [app]: new Date().toISOString() },
            lastSynced: new Date().toISOString(),
          },
        }
      })
    })

    set({ unsubscribe: unsub })
  },

  unsubscribeAll: () => {
    get().unsubscribe?.()
    set({ unsubscribe: null })
  },

  seedDemo: async (projectId, projectName) => {
    set({ seeding: true, error: null })
    try {
      await seedBridgeData(projectId, projectName)
      await get().fetchAll(projectId)
    } catch {
      set({ error: 'Failed to seed demo data' })
    } finally {
      set({ seeding: false })
    }
  },

  updateSyncStatus: (app, status) => {
    set((s) => {
      if (!s.ecosystem) return s
      return {
        ecosystem: {
          ...s.ecosystem,
          syncStatus: { ...s.ecosystem.syncStatus, [app]: status },
        },
      }
    })
  },

  clearError: () => set({ error: null }),
}))
