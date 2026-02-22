import { useState, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Flame, Home, Search, Bell, Pencil } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

export default function TopNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: api.notifications.getUnreadCount,
    enabled: !!user,
  })
  const unreadCount = unreadData?.count ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchInput('')
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
      isActive
        ? 'text-accent bg-accent/10'
        : 'text-secondary hover:bg-hover hover:text-primary'
    }`

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-sm border-b border-border-default">
      <div className="flex items-center gap-4 px-4 py-2 max-w-7xl mx-auto">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Flame className="w-7 h-7 text-accent" />
          <span className="text-lg font-bold text-primary hidden sm:inline">Aceverse</span>
        </Link>

        {/* Center-left: Nav links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <NavLink to="/" end className={navLinkClass}>
            {({ isActive }) => (
              <>
                <Home className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                <span>Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/trending" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <Flame className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                <span>Trending</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Center: Search (hidden on small screens) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block ml-auto mr-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
            <input
              type="search"
              placeholder="Search users, posts, games..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-tertiary border border-transparent text-primary text-sm placeholder-secondary focus:outline-none focus:border-accent"
            />
          </div>
        </form>

        {/* Right: Post button, Bell, Avatar */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          {/* Post button (hidden on small screens) */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>Post</span>
          </Link>

          {/* Bell with notification badge */}
          <div className="relative">
            <button
              ref={bellRef}
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="p-2 rounded-full text-secondary hover:bg-hover hover:text-primary transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent" />
              )}
            </button>
            <NotificationDropdown
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              anchorRef={bellRef}
            />
          </div>

          {/* User avatar */}
          <Link
            to={user ? `/u/${user.username}` : '/login'}
            className="shrink-0"
          >
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
              alt={user?.displayName || 'Profile'}
              className="w-8 h-8 rounded-full border border-border-default object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
