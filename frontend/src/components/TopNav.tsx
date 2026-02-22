import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Flame, Home, Search, Bell, Pencil } from 'lucide-react'

export default function TopNav() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchInput, setSearchInput] = useState('')

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
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'text-accent'
        : 'text-secondary hover:text-primary hover:bg-hover'
    }`

  return (
    <header className="sticky top-0 z-40 bg-primary/80 backdrop-blur-md border-b border-border-default hidden md:flex">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 h-14">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-accent font-bold text-lg">
            <Flame className="w-6 h-6" fill="currentColor" />
            <span>Aceverse</span>
          </Link>
          <nav className="flex items-center gap-1">
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
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
            <input
              type="search"
              placeholder="Search users, posts, games..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-tertiary text-primary text-sm placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </form>

        {/* Right: Post button, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>Post</span>
          </Link>

          <Link
            to="/notifications"
            className="relative p-2 rounded-full text-secondary hover:text-primary hover:bg-hover transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            )}
          </Link>

          <Link to={user ? `/u/${user.username}` : '/login'} className="shrink-0">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-border-default"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
