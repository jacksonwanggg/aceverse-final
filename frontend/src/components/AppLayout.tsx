import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import BottomNav from './BottomNav'

interface AppLayoutProps {
  /** When set, render this instead of Outlet (e.g. for /p/:postId when opened from a public link). */
  children?: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EF8C60] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 flex">
      <LeftSidebar />
      <main className="flex-1 min-w-0 flex flex-col border-x border-gray-800 max-w-2xl mx-auto w-full pb-20 md:pb-0">
        {children ?? <Outlet />}
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  )
}
