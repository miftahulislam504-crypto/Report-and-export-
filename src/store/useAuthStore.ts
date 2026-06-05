import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/firebase/config'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  init: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, initialized: true })
    })
    return unsubscribe
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      set({ error: msg })
    } finally {
      set({ loading: false })
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      set({ error: msg })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    await signOut(auth)
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
