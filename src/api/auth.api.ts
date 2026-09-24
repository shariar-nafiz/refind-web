import { apiClient } from './client'
import type { ApiResponse, AuthResponse, RegisterResponse, ResendOtpRequest, VerifyEmailRequest } from './types'

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
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload)
    return res.data.data
  },

  verifyEmail: async (payload: VerifyEmailRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-email', payload)
    return res.data.data
  },

  resendOtp: async (payload: ResendOtpRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/resend-otp', payload)
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

