import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useTheme } from '../hooks/useTheme'

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

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center py-2 px-3 min-w-[56px] rounded-lg transition-colors relative ${
    isActive ? 'text-accent' : 'text-secondary hover:text-primary'
  }`

export default function BottomNav() {
  const { user } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: api.notifications.getUnreadCount,
    enabled: !!user,
  })
  const unreadCount = unreadData?.count ?? 0
  
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-default bg-primary/95 backdrop-blur safe-area-pb md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <NavLink to="/" end className={navClass}>
        <span className="text-xl">🏠</span>
        <span className="text-[10px] mt-0.5">Home</span>
      </NavLink>
      <NavLink to="/trending" className={navClass}>
        <span className="text-xl">🔥</span>
        <span className="text-[10px] mt-0.5">Trending</span>
      </NavLink>
      <Link
        to="/"
        className="flex flex-col items-center justify-center py-2 px-4 -mt-6 rounded-full transition-transform active:scale-95 bg-accent"
        aria-label="Compose post"
      >
        <span className="text-2xl text-white">✏️</span>
      </Link>
      <NavLink to="/notifications" className={navClass}>
        <span className="text-xl relative inline-block">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold bg-accent text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span className="text-[10px] mt-0.5">Alerts</span>
      </NavLink>
      <button
        type="button"
        onClick={cycleTheme}
        className="flex flex-col items-center justify-center py-2 px-2 min-w-[48px] rounded-lg transition-colors text-secondary hover:text-primary"
        aria-label={`Theme: ${theme}`}
      >
        <ThemeIcon theme={theme} />
        <span className="text-[10px] mt-0.5 capitalize">{theme === 'system' ? 'Auto' : theme}</span>
      </button>
      <NavLink to={user ? `/u/${user.username}` : '/login'} className={navClass}>
        <span className="text-xl">👤</span>
        <span className="text-[10px] mt-0.5">Profile</span>
      </NavLink>
    </nav>
  )
}
