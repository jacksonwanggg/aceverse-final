import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

const accent = '#EF8C60'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center py-2 px-3 min-w-[64px] rounded-lg transition-colors relative ${
    isActive ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-white'
  }`

export default function BottomNav() {
  const { user } = useAuth()
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: api.notifications.getUnreadCount,
    enabled: !!user,
  })
  const unreadCount = unreadData?.count ?? 0
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-800 bg-[#0D0D0D]/95 backdrop-blur safe-area-pb md:hidden"
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
        className="flex flex-col items-center justify-center py-2 px-4 -mt-6 rounded-full transition-transform active:scale-95"
        style={{ backgroundColor: accent }}
        aria-label="Compose post"
      >
        <span className="text-2xl text-[#0D0D0D]">✏️</span>
      </Link>
      <NavLink to="/search" className={navClass}>
        <span className="text-xl">🔍</span>
        <span className="text-[10px] mt-0.5">Search</span>
      </NavLink>
      <NavLink to="/notifications" className={navClass}>
        <span className="text-xl relative inline-block">
          🔔
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold text-[#0D0D0D]"
              style={{ backgroundColor: accent }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span className="text-[10px] mt-0.5">Alerts</span>
      </NavLink>
      <NavLink to={user ? `/u/${user.username}` : '/login'} className={navClass}>
        <span className="text-xl">👤</span>
        <span className="text-[10px] mt-0.5">Profile</span>
      </NavLink>
    </nav>
  )
}
