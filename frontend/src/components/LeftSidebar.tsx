import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

const accent = '#EF8C60'

export default function LeftSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium transition-colors ${
      isActive
        ? 'text-[var(--primary)] bg-[var(--primary)]/10'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-gray-800 bg-[#0D0D0D] min-h-screen md:flex hidden">
      <div className="p-4 flex flex-col gap-4 sticky top-0">
        <Link
          to="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
            alt=""
            className="w-10 h-10 rounded-full border-2 object-cover"
            style={{ borderColor: accent }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{user?.displayName || 'User'}</p>
            <p className="text-sm text-gray-400 truncate">@{user?.username || 'username'}</p>
            {user && (
              <p className="text-xs text-gray-500">
                {(user as { followerCount?: number }).followerCount ?? 0} followers
              </p>
            )}
          </div>
        </Link>

        <nav className="flex flex-col gap-0.5">
          <NavLink to="/" end className={navLinkClass}>
            <span className="text-xl">🏠</span> Home
          </NavLink>
          <NavLink to="/trending" className={navLinkClass}>
            <span className="text-xl">🔥</span> Trending
          </NavLink>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span> Log out
          </button>
        </nav>

        {myGames.length > 0 && (
          <div className="pt-2 border-t border-gray-800">
            <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Games
            </h3>
            <ul className="mt-1 space-y-0.5">
              {myGames.slice(0, 6).map((g: { id: string; name: string; slug: string; color?: string }) => (
                <li key={g.id}>
                  <Link
                    to={`/explore?game=${g.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: g.color || accent }}
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
