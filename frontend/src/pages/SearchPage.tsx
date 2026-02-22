import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import PostCardSkeleton from '../components/PostCardSkeleton'
import { Search } from 'lucide-react'

const DEBOUNCE_MS = 300

type SearchType = 'top' | 'people' | 'latest'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const qFromUrl = searchParams.get('q') ?? ''
  const typeFromUrl = (searchParams.get('type') as SearchType) || 'top'
  const validType: SearchType =
    typeFromUrl === 'people' || typeFromUrl === 'latest' ? typeFromUrl : 'top'

  const [inputValue, setInputValue] = useState(qFromUrl)

  useEffect(() => {
    setInputValue(qFromUrl)
  }, [qFromUrl])

  useEffect(() => {
    if (inputValue === qFromUrl) return
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (inputValue.trim()) {
            next.set('q', inputValue.trim())
          } else {
            next.delete('q')
          }
          return next
        },
        { replace: true }
      )
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [inputValue, qFromUrl, setSearchParams])

  const query = (searchParams.get('q') ?? '').trim()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', query, validType],
    queryFn: () => api.search(query, validType),
    enabled: query.length > 0,
  })

  const users = data?.users ?? []
  const posts = data?.posts ?? []

  const followMutation = useMutation({
    mutationFn: (username: string) => api.users.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const unfollowMutation = useMutation({
    mutationFn: (username: string) => api.users.unfollow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onSettled: () => {
      if (query) queryClient.invalidateQueries({ queryKey: ['search', query, validType] })
    },
  })
  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unlike(postId),
    onSettled: () => {
      if (query) queryClient.invalidateQueries({ queryKey: ['search', query, validType] })
    },
  })
  const repostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.repost(postId),
    onSettled: () => {
      if (query) queryClient.invalidateQueries({ queryKey: ['search', query, validType] })
    },
  })
  const unrepostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unrepost(postId),
    onSettled: () => {
      if (query) queryClient.invalidateQueries({ queryKey: ['search', query, validType] })
    },
  })

  const setType = useCallback(
    (t: SearchType) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('type', t)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const showEmpty =
    query.length > 0 && !isLoading && !isError && users.length === 0 && posts.length === 0

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
      <h1 className="text-page-title-lg text-primary mb-4">Search</h1>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none" />
        <input
          type="search"
          placeholder="Search gamers and posts..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-tertiary border border-border-default text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          aria-label="Search"
        />
      </div>

      {query.length > 0 && (
        <div className="flex gap-1 border-b border-border-default mb-4">
          {(
            [
              { key: 'top' as const, label: 'Top' },
              { key: 'people' as const, label: 'People' },
              { key: 'latest' as const, label: 'Latest' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                validType === key
                  ? 'bg-accent text-white border-b-2 border-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading && query.length > 0 && (
        <div className="space-y-2">
          {validType === 'people' ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-tertiary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-tertiary rounded w-1/3" />
                  <div className="h-3 bg-secondary rounded w-1/4" />
                </div>
              </div>
            ))
          ) : (
            [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)
          )}
        </div>
      )}

      {showEmpty && (
        <div className="py-8 text-center">
          <p className="text-secondary text-lg">
            No results for &quot;{query}&quot;
          </p>
          <p className="text-tertiary text-sm mt-2">
            Try different keywords or check out <Link to="/trending" className="text-accent hover:underline">Trending</Link> and <Link to="/explore" className="text-accent hover:underline">Explore</Link>.
          </p>
        </div>
      )}

      {!showEmpty && !isLoading && query.length > 0 && (
        <div className="space-y-4">
          {validType === 'top' && (
            <>
              {users.length > 0 && (
                <section>
                  <h2 className="text-section text-secondary uppercase tracking-wider mb-2">
                    People
                  </h2>
                  <ul className="space-y-2">
                    {users.map(
                      (u: {
                        id: string
                        username: string
                        displayName: string
                        avatarUrl: string
                        bio: string
                        isFollowing: boolean
                        isMe: boolean
                      }) => (
                        <li
                          key={u.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-hover transition-colors"
                        >
                          <Link
                            to={`/u/${u.username}`}
                            className="flex items-center gap-3 min-w-0 flex-1"
                          >
                            <img
                              src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.username}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-primary truncate">
                                {u.displayName}
                              </p>
                              <p className="text-sm text-secondary truncate">
                                @{u.username}
                              </p>
                              {u.bio && (
                                <p className="text-sm text-tertiary truncate mt-0.5">
                                  {u.bio}
                                </p>
                              )}
                            </div>
                          </Link>
                          {!u.isMe && (
                            <button
                              type="button"
                              onClick={() =>
                                u.isFollowing
                                  ? unfollowMutation.mutate(u.username)
                                  : followMutation.mutate(u.username)
                              }
                              disabled={
                                followMutation.isPending || unfollowMutation.isPending
                              }
                              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[90px] ${
                                u.isFollowing
                                  ? 'border border-border-default text-secondary'
                                  : 'bg-accent text-white'
                              }`}
                            >
                              {(followMutation.isPending || unfollowMutation.isPending) && (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                              )}
                              {u.isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}
              {posts.length > 0 && (
                <section>
                  <h2 className="text-section text-secondary uppercase tracking-wider mb-2">
                    Posts
                  </h2>
                  <div className="space-y-2">
                    {posts.map((post: any) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={() =>
                          post.likedByMe
                            ? unlikeMutation.mutate(post.id)
                            : likeMutation.mutate(post.id)
                        }
                        onRepost={() =>
                          post.repostedByMe
                            ? unrepostMutation.mutate(post.id)
                            : repostMutation.mutate(post.id)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {validType === 'people' && (
            <ul className="space-y-2">
              {users.map(
                (u: {
                  id: string
                  username: string
                  displayName: string
                  avatarUrl: string
                  bio: string
                  isFollowing: boolean
                  isMe: boolean
                }) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-hover transition-colors"
                  >
                    <Link
                      to={`/u/${u.username}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <img
                        src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.username}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary truncate">
                          {u.displayName}
                        </p>
                        <p className="text-sm text-secondary truncate">
                          @{u.username}
                        </p>
                        {u.bio && (
                          <p className="text-sm text-tertiary truncate mt-0.5">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                    {!u.isMe && (
                      <button
                        type="button"
                        onClick={() =>
                          u.isFollowing
                            ? unfollowMutation.mutate(u.username)
                            : followMutation.mutate(u.username)
                        }
                        disabled={
                          followMutation.isPending || unfollowMutation.isPending
                        }
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[90px] ${
                          u.isFollowing
                            ? 'border border-border-default text-secondary'
                            : 'bg-accent text-white'
                        }`}
                      >
                        {(followMutation.isPending || unfollowMutation.isPending) && (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                        )}
                        {u.isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                  </li>
                )
              )}
            </ul>
          )}

          {validType === 'latest' && (
            <div className="space-y-2">
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() =>
                    post.likedByMe
                      ? unlikeMutation.mutate(post.id)
                      : likeMutation.mutate(post.id)
                  }
                  onRepost={() =>
                    post.repostedByMe
                      ? unrepostMutation.mutate(post.id)
                      : repostMutation.mutate(post.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {query.length === 0 && (
        <p className="text-tertiary py-8">
          Enter a name or keyword to search people and posts.
        </p>
      )}
    </div>
  )
}
