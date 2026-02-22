import { Link } from 'react-router-dom'
import PostThreadPage from './PostThreadPage'

export default function StandalonePostThreadPage() {
  return (
    <div className="min-h-screen bg-primary text-primary">
      <nav className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-primary/95 backdrop-blur-md border-b border-border-default">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">
          AceVerse
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-secondary hover:text-primary transition-colors rounded-full"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full font-medium bg-accent text-white transition-all hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div
        className="mx-auto max-w-2xl border-x border-border-default min-h-[60px] flex items-center justify-center gap-2 px-4 py-3 text-secondary text-sm bg-accent/10 border-b border-accent/20"
      >
        <span>Log in to like, reply, and repost.</span>
        <Link to="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
        <span>or</span>
        <Link to="/register" className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </div>

      <PostThreadPage readOnly />
    </div>
  )
}
