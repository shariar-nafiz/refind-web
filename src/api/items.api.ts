import { apiClient } from './client'
import type {
  ApiResponse,
  Item,
  ItemCreateRequest,
  ItemSearchParams,
  ItemStatus,
  ItemUpdateRequest,
  PaginationMeta,
} from './types'

export interface PaginatedItemsResult {
  items: Item[]
  pagination?: PaginationMeta
}

export const itemsApi = {
  create: async (payload: ItemCreateRequest): Promise<Item> => {
    const res = await apiClient.post<ApiResponse<Item>>('/items', payload)
    return res.data.data
  },

  search: async (params: ItemSearchParams = {}): Promise<PaginatedItemsResult> => {
    const res = await apiClient.get<ApiResponse<Item[]>>('/items', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination,
    }
  },

  getRecent: async (type: 'LOST' | 'FOUND' = 'LOST', limit: number = 6): Promise<Item[]> => {
    const res = await apiClient.get<ApiResponse<Item[]>>('/items/recent', {
      params: { type, limit },
    })
    return res.data.data
  },

  getMyItems: async (
    type?: 'LOST' | 'FOUND',
    status?: ItemStatus,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedItemsResult> => {
    const res = await apiClient.get<ApiResponse<Item[]>>('/items/my-items', {
      params: { type, status, page, size },
    })
    return {
      items: res.data.data,
      pagination: res.data.pagination,
    }
  },

  getById: async (id: number): Promise<Item> => {
    const res = await apiClient.get<ApiResponse<Item>>(`/items/${id}`)
    return res.data.data
  },

  update: async (id: number, payload: ItemUpdateRequest): Promise<Item> => {
    const res = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, payload)
    return res.data.data
  },

  updateStatus: async (id: number, status: ItemStatus): Promise<Item> => {
    const res = await apiClient.patch<ApiResponse<Item>>(`/items/${id}/status`, { status })
    return res.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/items/${id}`)
  },
}
