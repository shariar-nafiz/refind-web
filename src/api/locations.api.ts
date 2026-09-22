import { apiClient } from './client'
import type { ApiResponse, DistrictSummary, Thana } from './types'

export const locationsApi = {
  getDivisions: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiResponse<string[]>>('/locations/divisions')
    return res.data.data
  },

  getAllDistricts: async (): Promise<DistrictSummary[]> => {
    const res = await apiClient.get<ApiResponse<DistrictSummary[]>>('/locations/districts')
    return res.data.data
  },

  getDistrictsByDivision: async (division: string): Promise<string[]> => {
    const res = await apiClient.get<ApiResponse<string[]>>('/locations/districts/by-division', {
      params: { division },
    })
    return res.data.data
  },

  getThanasByDistrict: async (district: string): Promise<Thana[]> => {
    const res = await apiClient.get<ApiResponse<Thana[]>>('/locations/thanas', {
      params: { district },
    })
    return res.data.data
  },

  search: async (query: string): Promise<Thana[]> => {
    const res = await apiClient.get<ApiResponse<Thana[]>>('/locations/search', {
      params: { query },
    })
    return res.data.data
  },

  getById: async (id: number): Promise<Thana> => {
    const res = await apiClient.get<ApiResponse<Thana>>(`/locations/${id}`)
    return res.data.data
  },
}
