import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { format } from 'date-fns'

const accent = '#EF8C60'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profileData } = useQuery({
    queryKey: ['users', username],
    queryFn: () => api.users.getProfile(username!),
    enabled: !!username,
  })
  const { data: gamesData } = useQuery({
    queryKey: ['users', username, 'games'],
    queryFn: () => api.users.getGames(username!),
    enabled: !!username,
  })

  const user = profileData?.user
  const userGames = gamesData?.userGames ?? []

  if (!username) {
    return (
      <div className="p-4 text-gray-400">Invalid profile.</div>
    )
  }
  if (!user) {
    return (
      <div className="p-4 text-gray-400">Loading...</div>
    )
  }

  const joinDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : ''

  return (
    <div className="min-h-screen">
      {/* Cover area */}
      <div
        className="h-32 md:h-40 w-full"
        style={{ backgroundColor: '#1A1A1A' }}
      />
      <div className="px-4 -mt-16 md:-mt-20 relative z-10 pb-4">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + username}
            alt=""
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0D0D0D] object-cover shrink-0"
            style={{ borderColor: '#0D0D0D' }}
          />
          <div className="mt-3 md:mt-0 flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">
              {user.displayName || username}
            </h1>
            <p className="text-gray-400">@{user.username}</p>
            {joinDate && (
              <p className="text-sm text-gray-500 mt-1">Joined {joinDate}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span><strong className="text-white">{user.followerCount ?? 0}</strong> followers</span>
              <span><strong className="text-white">{user.followingCount ?? 0}</strong> following</span>
            </div>
          </div>
        </div>
        {user.bio && (
          <p className="mt-4 text-gray-300 whitespace-pre-wrap">{user.bio}</p>
        )}

        {/* Gaming Ranks section */}
        {userGames.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Gaming Ranks
            </h2>
            <ul className="space-y-3">
              {userGames.map((ug: {
                id: string
                rank: string
                rankTier: string
                updatedAt: string
                game: { id: string; name: string; slug: string; iconUrl?: string; color?: string } | null
              }) => (
                <li
                  key={ug.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/60 border border-gray-700/50"
                >
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: `${ug.game?.color || accent}30`, color: ug.game?.color || accent }}
                    title={ug.rank}
                  >
                    {ug.game?.iconUrl ? (
                      <img src={ug.game.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      '🏆'
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{ug.game?.name ?? 'Game'}</p>
                    <p className="text-sm" style={{ color: accent }}>{ug.rank}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Updated {format(new Date(ug.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold shrink-0"
                    style={{ backgroundColor: `${ug.game?.color || accent}40`, color: ug.game?.color || accent }}
                  >
                    {ug.rankTier}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* User's posts tab placeholder - Phase 10 will add full tab */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-sm">Posts tab — see timeline for this user&apos;s posts.</p>
        </div>
      </div>
    </div>
  )
}
