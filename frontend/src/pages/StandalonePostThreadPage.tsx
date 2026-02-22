import { Link } from 'react-router-dom'
import PostThreadPage from './PostThreadPage'

export default function StandalonePostThreadPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100">
      <nav className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-gray-800">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          AceVerse
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-full"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full font-medium text-[#0D0D0D] transition-all hover:opacity-90"
            style={{ backgroundColor: '#EF8C60' }}
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div
        className="mx-auto max-w-2xl border-x border-gray-800 min-h-[60px] flex items-center justify-center gap-2 px-4 py-3 text-gray-300 text-sm"
        style={{ backgroundColor: 'rgba(239, 140, 96, 0.08)', borderBottom: '1px solid rgba(239, 140, 96, 0.2)' }}
      >
        <span>Log in to like, reply, and repost.</span>
        <Link to="/login" className="font-medium text-[#EF8C60] hover:underline">
          Log in
        </Link>
        <span>or</span>
        <Link to="/register" className="font-medium text-[#EF8C60] hover:underline">
          Sign up
        </Link>
      </div>

      <PostThreadPage readOnly />
    </div>
  )
}
