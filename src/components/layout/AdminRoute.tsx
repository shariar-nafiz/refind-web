import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export const AdminRoute = () => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
