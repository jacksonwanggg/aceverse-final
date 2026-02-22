import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Gamepad2, Users, UserPlus, TrendingUp, Trophy } from 'lucide-react'

export default function RightSidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const { data: ranksData } = useQuery({
    queryKey: ['users', user?.username, 'games'],
    queryFn: () => api.users.getGames(user!.username),
    enabled: !!user?.username,
  })
  const { data: followingData } = useQuery({
    queryKey: ['users', 'me', 'following'],
    queryFn: api.users.getFollowing,
    enabled: !!user,
  })
  const { data: suggestionsData } = useQuery({
    queryKey: ['users', 'suggestions'],
    queryFn: () => api.users.getSuggestions(5),
    enabled: !!user,
  })
  const { data: tagsData } = useQuery({
    queryKey: ['timeline', 'trending-tags'],
    queryFn: api.timeline.trendingTags,
  })

  const followMutation = useMutation({
    mutationFn: (username: string) => api.users.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const userGames = ranksData?.userGames ?? []
  const following = followingData?.users ?? []
  const suggestions = suggestionsData?.users ?? []
  const tags = tagsData?.tags?.slice(0, 5) ?? []

  return (
    <aside className="w-[320px] shrink-0 flex flex-col border-l border-border-default bg-primary min-h-screen overflow-y-auto hidden lg:flex sticky top-0 max-h-screen">
      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-tertiary border border-border-default text-primary text-sm placeholder-secondary focus:outline-none focus:border-accent"
            aria-label="Search"
          />
        </form>

        {/* Your Ranks */}
        {userGames.length > 0 && (
          <section className="p-4 rounded-xl bg-secondary">
            <h3 className="flex items-center gap-2 text-section text-secondary mb-3">
              <Gamepad2 className="w-4 h-4" />
              Your Ranks
            </h3>
            <ul className="space-y-2">
              {userGames.slice(0, 3).map((ug: { id: string; rank: string; rankTier: string; game: { name: string; slug: string; color?: string } | null }) => (
                <li
                  key={ug.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-hover transition-colors"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${ug.game?.color || 'var(--color-accent)'}22`, color: ug.game?.color || 'var(--color-accent)' }}
                    title={ug.rank}
                  >
                    <Trophy className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-primary truncate flex-1">{ug.game?.name ?? 'Game'}</span>
                  <span className="text-xs font-medium truncate max-w-[100px] text-accent">
                    {ug.rank}
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/trending" className="block mt-3 text-sm text-accent hover:underline">
              View all games →
            </Link>
          </section>
        )}

        {/* Friends Online */}
        {following.length > 0 && (
          <section className="bg-secondary rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-section text-secondary mb-3">
              <Users className="w-4 h-4" />
              Friends Online
            </h3>
            <ul className="space-y-1.5">
              {following.slice(0, 4).map((u: { id: string; username: string; displayName: string; avatarUrl: string }) => (
                <li key={u.id}>
                  <Link
                    to={`/u/${u.username}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-hover transition-colors"
                  >
                    <span className="relative">
                      <img
                        src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.username}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 bg-green-500"
                        style={{ borderColor: 'var(--color-bg-primary)' }}
                        title="Online"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-primary truncate block">{u.displayName || u.username}</span>
                      <span className="text-xs text-green-500">Online</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Who to Follow */}
        {suggestions.length > 0 && (
          <section className="bg-secondary rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-section text-secondary mb-3">
              <UserPlus className="w-4 h-4" />
              Who to Follow
            </h3>
            <ul className="space-y-2">
              {suggestions.map((u: { id: string; username: string; displayName: string; avatarUrl: string; isFollowing?: boolean; followerCount?: number }) => (
                <li
                  key={u.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-hover transition-colors"
                >
                  <Link to={`/u/${u.username}`} className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.username}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">@{u.username}</p>
                      <p className="text-xs text-secondary truncate">{u.followerCount?.toLocaleString() ?? 0} followers</p>
                    </div>
                  </Link>
                  {!u.isFollowing && (
                    <button
                      type="button"
                      onClick={() => followMutation.mutate(u.username)}
                      disabled={followMutation.isPending}
                      className="shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-50 inline-flex items-center gap-1.5 bg-accent text-white"
                    >
                      {followMutation.isPending && (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                      )}
                      Follow
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Trending */}
        {tags.length > 0 && (
          <section className="bg-secondary rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-section text-secondary mb-3">
              <TrendingUp className="w-4 h-4" />
              Trending
            </h3>
            <ul className="space-y-1.5">
              {tags.map((tag: { slug: string; name: string; count: number }) => (
                <li key={tag.slug}>
                  <Link
                    to={`/trending?game=${tag.slug}`}
                    className="block p-2 rounded-lg hover:bg-hover transition-colors"
                  >
                    <p className="text-sm font-semibold text-primary">#{tag.name}</p>
                    <p className="text-xs text-secondary">{tag.count}+ posts</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  )
}
