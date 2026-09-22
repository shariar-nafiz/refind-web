import { apiClient } from './client'
import type { ApiResponse, MediaUploadResponse } from './types'

export const mediaApi = {
  upload: async (file: File, folder: string = 'items'): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const res = await apiClient.post<ApiResponse<MediaUploadResponse>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },
}
