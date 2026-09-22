import { apiClient } from './client'
import type {
  Address,
  ApiResponse,
  DashboardOverview,
  PaginationMeta,
  User,
  UserPreferences,
  UserRole,
} from './types'

export interface PaginatedUsersResult {
  users: User[]
  pagination?: PaginationMeta
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me')
    return res.data.data
  },

  updateProfile: async (payload: {
    fullName?: string
    bio?: string
    secondaryPhone?: string
  }): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>('/users/me', payload)
    return res.data.data
  },

  uploadAvatar: async (file: File): Promise<{ id: number; avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post<ApiResponse<{ id: number; avatarUrl: string }>>(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return res.data.data
  },

  getDashboard: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>('/users/me/dashboard')
    return res.data.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/users/me/password', {
      currentPassword,
      newPassword,
    })
  },

  // Addresses
  getAddresses: async (): Promise<Address[]> => {
    const res = await apiClient.get<ApiResponse<Address[]>>('/users/me/addresses')
    return res.data.data
  },

  addAddress: async (payload: Omit<Address, 'id'>): Promise<Address> => {
    const res = await apiClient.post<ApiResponse<Address>>('/users/me/addresses', payload)
    return res.data.data
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/users/me/addresses/${id}/default`)
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/users/me/addresses/${id}`)
  },

  // Preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const res = await apiClient.get<ApiResponse<UserPreferences>>('/users/me/preferences')
    return res.data.data
  },

  updatePreferences: async (payload: Partial<UserPreferences>): Promise<UserPreferences> => {
    const res = await apiClient.put<ApiResponse<UserPreferences>>('/users/me/preferences', payload)
    return res.data.data
  },

  getPublicProfile: async (id: number): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}/public`)
    return res.data.data
  },

  // Admin User Moderation
  adminGetAllUsers: async (params?: {
    query?: string
    status?: string
    role?: string
    page?: number
    size?: number
  }): Promise<PaginatedUsersResult> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params })
    return {
      users: res.data.data,
      pagination: res.data.pagination,
    }
  },

  adminUpdateUserStatus: async (
    id: number,
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  ): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/admin/users/${id}/status`, { status })
  },

  adminUpdateUserRole: async (id: number, role: UserRole): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/admin/users/${id}/role`, { role })
  },
}
