import { create } from 'zustand'
import type { User, AuthResponse } from '@/api/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (authData: AuthResponse) => void
  setTokens: (accessToken: string, refreshToken?: string) => void
  updateUser: (partialUser: Partial<User>) => void
  logout: () => void
}

const getStoredAuth = () => {
  try {
    const accessToken = localStorage.getItem('refind-access-token')
    const refreshToken = localStorage.getItem('refind-refresh-token')
    const userStr = localStorage.getItem('refind-user')
    const user = userStr ? JSON.parse(userStr) : null
    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
    }
  } catch {
    return { accessToken: null, refreshToken: null, user: null, isAuthenticated: false }
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = getStoredAuth()

  return {
    ...initial,
    setAuth: (authData: AuthResponse) => {
      const user: User = {
        id: authData.userId,
        email: authData.email,
        phone: authData.phone,
        fullName: authData.fullName,
        role: authData.role,
      }
      localStorage.setItem('refind-access-token', authData.accessToken)
      localStorage.setItem('refind-refresh-token', authData.refreshToken)
      localStorage.setItem('refind-user', JSON.stringify(user))

      set({
        user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        isAuthenticated: true,
      })
    },
    setTokens: (accessToken: string, refreshToken?: string) => {
      localStorage.setItem('refind-access-token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refind-refresh-token', refreshToken)
      }
      set((state) => ({
        accessToken,
        refreshToken: refreshToken ?? state.refreshToken,
        isAuthenticated: true,
      }))
    },
    updateUser: (partialUser: Partial<User>) => {
      set((state) => {
        if (!state.user) return state
        const updated = { ...state.user, ...partialUser }
        localStorage.setItem('refind-user', JSON.stringify(updated))
        return { user: updated }
      })
    },
    logout: () => {
      localStorage.removeItem('refind-access-token')
      localStorage.removeItem('refind-refresh-token')
      localStorage.removeItem('refind-user')
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      })
    },
  }
})
