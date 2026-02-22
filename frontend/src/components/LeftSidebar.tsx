import { useState, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import NotificationDropdown from './NotificationDropdown'

function ThemeIcon({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  if (theme === 'light') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    )
  }
  if (theme === 'dark') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export default function LeftSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
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

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

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
            onClick={cycleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium text-secondary hover:bg-hover hover:text-primary transition-colors"
            title={`Theme: ${themeLabel}`}
          >
            <span className="text-xl flex items-center justify-center w-[1em]">
              <ThemeIcon theme={theme} />
            </span>
            <span>{themeLabel}</span>
          </button>
          
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

        <div className="mt-auto pt-4 border-t border-border-default">
          <p className="text-xs text-tertiary px-3">
            <Link to="#" className="hover:underline">About</Link>
            {' · '}
            <Link to="#" className="hover:underline">Help</Link>
            {' · '}
            <Link to="#" className="hover:underline">Terms</Link>
            {' · '}
            <Link to="#" className="hover:underline">Privacy</Link>
          </p>
          <p className="text-xs text-tertiary px-3 mt-1">© 2024 Aceverse</p>
        </div>
      </div>
    </aside>
  )
}
