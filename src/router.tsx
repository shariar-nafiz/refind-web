import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { Home } from '@/pages/Home'
import { ItemsDirectory } from '@/pages/ItemsDirectory'
import { ItemDetail } from '@/pages/ItemDetail'
import { Login } from '@/pages/Auth/Login'
import { Register } from '@/pages/Auth/Register'
import { ReportWizard } from '@/pages/ReportWizard'
import { DashboardHome } from '@/pages/Dashboard/DashboardHome'
import { MyItems } from '@/pages/Dashboard/MyItems'
import { Addresses } from '@/pages/Dashboard/Addresses'
import { Settings } from '@/pages/Dashboard/Settings'
import { AdminDashboard } from '@/pages/Admin/AdminDashboard'
import { AdminCategories } from '@/pages/Admin/AdminCategories'
import { AdminUsers } from '@/pages/Admin/AdminUsers'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'items', element: <ItemsDirectory /> },
      { path: 'items/:id', element: <ItemDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Protected User Routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'report', element: <ReportWizard /> },
          { path: 'dashboard', element: <DashboardHome /> },
          { path: 'dashboard/my-items', element: <MyItems /> },
          { path: 'dashboard/addresses', element: <Addresses /> },
          { path: 'dashboard/settings', element: <Settings /> },
        ],
      },

      // Admin Only Routes
      {
        element: <AdminRoute />,
        children: [
          { path: 'admin', element: <AdminDashboard /> },
          { path: 'admin/categories', element: <AdminCategories /> },
          { path: 'admin/users', element: <AdminUsers /> },
        ],
      },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
