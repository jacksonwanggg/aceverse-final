import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import { Home, Flame, Search, Bell, User, Sun, Moon, Monitor, Pencil } from 'lucide-react'

function ThemeIcon({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  const iconClass = "w-5 h-5"
  if (theme === 'light') return <Sun className={iconClass} />
  if (theme === 'dark') return <Moon className={iconClass} />
  return <Monitor className={iconClass} />
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
        {({ isActive }) => (
          <>
            <Home className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-0.5">Home</span>
          </>
        )}
      </NavLink>
      <NavLink to="/trending" className={navClass}>
        {({ isActive }) => (
          <>
            <Flame className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-0.5">Trending</span>
          </>
        )}
      </NavLink>
      <Link
        to="/"
        className="flex flex-col items-center justify-center py-2 px-4 -mt-6 rounded-full transition-transform active:scale-95 bg-accent"
        aria-label="Compose post"
      >
        <Pencil className="w-6 h-6 text-white" />
      </Link>
      <NavLink to="/search" className={navClass}>
        {({ isActive }) => (
          <>
            <Search className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5">Search</span>
          </>
        )}
      </NavLink>
      <NavLink to="/notifications" className={navClass}>
        {({ isActive }) => (
          <>
            <span className="relative">
              <Bell className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold bg-accent text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] mt-0.5">Alerts</span>
          </>
        )}
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
        {({ isActive }) => (
          <>
            <User className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-0.5">Profile</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
