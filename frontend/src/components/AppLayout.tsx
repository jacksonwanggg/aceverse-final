import { useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import TopNav from './TopNav'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import BottomNav from './BottomNav'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

interface AppLayoutProps {
  /** When set, render this instead of Outlet (e.g. for /p/:postId when opened from a public link). */
  children?: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const content = children ?? (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="min-h-full flex flex-col"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-primary text-primary flex flex-col">
      <ScrollToTop />
      <TopNav />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 min-w-0 flex flex-col border-x border-border-default max-w-2xl mx-auto w-full pb-20 md:pb-0">
          {content}
        </main>
        <RightSidebar />
      </div>
      <BottomNav />
    </div>
  )
}
