import { apiClient } from './client'
import type { ApiResponse, AuthResponse } from './types'

export interface RegisterPayload {
  email: string
  phone: string
  fullName: string
  password?: string
}

export interface LoginPayload {
  identifier: string
  password?: string
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload)
    return res.data.data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    return res.data.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/auth/logout')
    } catch {
      // Ignore network errors on logout
    }
  },
}
