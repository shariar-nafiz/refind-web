import { apiClient } from './client'
import type { ApiResponse, Category } from './types'

export const categoriesApi = {
  getAllActive: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories')
    return res.data.data
  },

  getById: async (id: number): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`)
    return res.data.data
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`)
    return res.data.data
  },

  // Admin
  adminGetAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/admin/categories')
    return res.data.data
  },

  adminCreate: async (payload: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload)
    return res.data.data
  },

  adminUpdate: async (id: number, payload: Partial<Category>): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload)
    return res.data.data
  },

  adminDelete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/categories/${id}`)
  },
}
