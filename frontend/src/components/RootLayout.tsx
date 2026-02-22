import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from './AppLayout'
import LandingPage from '../pages/LandingPage'
import HomePage from '../pages/HomePage'

/**
 * At "/": when logged out, only the index route is allowed (landing); when logged in, wrap in AppLayout.
 * Other paths (explore, trending, etc.) require login when not authenticated.
 */
export function OptionalAuthLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EF8C60] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />
    }
    return <Outlet />
  }

  return <AppLayout />
}

/**
 * At index "/": show landing when logged out, home feed when logged in.
 */
export function HomeOrLanding() {
  const { user } = useAuth()
  if (!user) return <LandingPage />
  return <HomePage />
}
