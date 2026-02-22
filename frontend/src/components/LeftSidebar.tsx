import { useState, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import NotificationDropdown from './NotificationDropdown'
import { Home, Flame, Bell, User, LogOut, Sun, Moon, Monitor, Gamepad2 } from 'lucide-react'

function ThemeIcon({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  const iconClass = "w-5 h-5"
  if (theme === 'light') return <Sun className={iconClass} />
  if (theme === 'dark') return <Moon className={iconClass} />
  return <Monitor className={iconClass} />
}

export default function LeftSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
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
    `flex items-center gap-3 px-3 py-2.5 rounded-full text-left font-medium transition-colors ${
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
            className="w-12 h-12 rounded-full border-2 border-accent object-cover"
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

        <nav className="flex flex-col gap-0.5">
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
          <NavLink to={user ? `/u/${user.username}` : '/login'} className={navLinkClass}>
            {({ isActive }) => (
              <>
                <User className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                <span>Profile</span>
              </>
            )}
          </NavLink>
          
          <div className="relative flex items-center">
            <NavLink to="/notifications" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <Bell className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold bg-accent text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
            <button
              ref={bellRef}
              type="button"
              onClick={(e) => { e.preventDefault(); setDropdownOpen((o) => !o); }}
              className="absolute right-2 p-1 rounded-md hover:bg-hover text-secondary hover:text-primary"
              aria-label="Toggle notifications dropdown"
            >
              <Bell className="w-4 h-4" />
            </button>
            <NotificationDropdown
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              anchorRef={bellRef}
            />
          </div>
          
          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-left font-medium text-secondary hover:bg-hover hover:text-primary transition-colors"
            title={`Theme: ${themeLabel}`}
          >
            <ThemeIcon theme={theme} />
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-left font-medium text-secondary hover:bg-hover hover:text-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </nav>

        {myGames.length > 0 && (
          <div className="pt-4 border-t border-border-default">
            <h3 className="flex items-center gap-2 px-3 py-1 text-section text-secondary uppercase tracking-wider">
              <Gamepad2 className="w-4 h-4" />
              Your Games
            </h3>
            <ul className="mt-1 space-y-0.5">
              {myGames.slice(0, 6).map((g: { id: string; name: string; slug: string; color?: string }) => (
                <li key={g.id}>
                  <Link
                    to={`/trending?game=${g.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary hover:bg-hover hover:text-primary text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
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
