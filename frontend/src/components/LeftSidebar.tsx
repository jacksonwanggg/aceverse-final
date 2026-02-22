import { useState, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import NotificationDropdown from './NotificationDropdown'

export default function LeftSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const bellRef = useRef<HTMLButtonElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }
  const { data: gamesData } = useQuery({
    queryKey: ['games'],
    queryFn: api.games.getAll,
  })
  const { data: userGamesData } = useQuery({
    queryKey: ['users', user?.username, 'games'],
    queryFn: () => api.users.getGames(user!.username),
    enabled: !!user?.username,
  })

  const games = gamesData?.games ?? []
  const userGames = userGamesData?.userGames ?? []
  const myGameIds = new Set(userGames.map((ug: { gameId: string }) => ug.gameId))
  const myGames = games.filter((g: { id: string }) => myGameIds.has(g.id))
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: api.notifications.getUnreadCount,
    enabled: !!user,
  })
  const unreadCount = unreadData?.count ?? 0

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium transition-colors ${
      isActive
        ? 'text-accent bg-accent/10'
        : 'text-secondary hover:bg-hover hover:text-primary'
    }`

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-border-default bg-primary min-h-screen md:flex hidden">
      <div className="p-4 flex flex-col gap-4 sticky top-0">
        <Link
          to="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-hover transition-colors"
        >
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-accent object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-primary truncate">{user?.displayName || 'User'}</p>
            <p className="text-sm text-secondary truncate">@{user?.username || 'username'}</p>
            {user && (
              <p className="text-xs text-tertiary">
                {(user as { followerCount?: number }).followerCount ?? 0} followers
              </p>
            )}
          </div>
        </Link>

        <form onSubmit={handleSearch} className="mb-2">
          <div className="flex gap-1">
            <input
              type="search"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-tertiary border border-border-default text-primary text-sm placeholder-secondary focus:outline-none focus:border-accent"
              aria-label="Search"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm font-medium shrink-0 bg-accent text-primary"
              aria-label="Submit search"
            >
              🔍
            </button>
          </div>
        </form>

        <nav className="flex flex-col gap-0.5">
          <NavLink to="/" end className={navLinkClass}>
            <span className="text-xl">🏠</span> Home
          </NavLink>
          <NavLink to="/trending" className={navLinkClass}>
            <span className="text-xl">🔥</span> Trending
          </NavLink>
          <div className="relative flex items-center">
            <NavLink to="/notifications" className={navLinkClass}>
              <span className="text-xl">🔔</span> Notifications
            </NavLink>
            <button
              ref={bellRef}
              type="button"
              onClick={(e) => { e.preventDefault(); setDropdownOpen((o) => !o); }}
              className="absolute right-1 p-1 rounded-md hover:bg-hover text-secondary hover:text-primary"
              aria-label="Toggle notifications"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold bg-accent text-primary">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              anchorRef={bellRef}
            />
          </div>
          <NavLink to={user ? `/u/${user.username}` : '/login'} className={navLinkClass}>
            <span className="text-xl">👤</span> Profile
          </NavLink>
          <button
            type="button"
            onClick={async () => {
              try {
                await logout()
              } finally {
                navigate('/login')
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium text-secondary hover:bg-hover hover:text-primary transition-colors"
          >
            <span className="text-xl">🚪</span> Log out
          </button>
        </nav>

        {myGames.length > 0 && (
          <div className="pt-2 border-t border-border-default">
            <h3 className="px-3 py-1 text-xs font-semibold text-tertiary uppercase tracking-wider">
              Your Games
            </h3>
            <ul className="mt-1 space-y-0.5">
              {myGames.slice(0, 6).map((g: { id: string; name: string; slug: string; color?: string }) => (
                <li key={g.id}>
                  <Link
                    to={`/explore?game=${g.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary hover:bg-hover hover:text-primary text-sm"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: g.color || 'var(--color-accent)' }}
                    />
                    <span className="truncate">{g.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
