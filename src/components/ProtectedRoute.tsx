import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

interface PublicOnlyRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Route that redirects authenticated users away (e.g., login page)
 */
export function PublicOnlyRoute({ children, redirectTo = '/' }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
