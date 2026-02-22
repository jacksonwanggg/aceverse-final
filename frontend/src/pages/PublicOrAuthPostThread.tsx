import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/AppLayout'
import PostThreadPage from './PostThreadPage'
import StandalonePostThreadPage from './StandalonePostThreadPage'

/**
 * For /p/:postId: when logged in show full app layout + thread; when logged out show standalone read-only thread with login banner.
 */
export default function PublicOrAuthPostThread() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <StandalonePostThreadPage />
  }

  return (
    <AppLayout children={<PostThreadPage />} />
  )
}
