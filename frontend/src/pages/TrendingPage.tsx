import { useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import PostCard from '../components/PostCard'
import PostCardSkeleton from '../components/PostCardSkeleton'
import { api } from '../lib/api'

interface TimelinePost {
  id: string
  content: string | null
  gameTag?: string | null
  game?: { name: string; slug: string; color: string } | null
  deleted?: boolean
  createdAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string }
  replyCount: number
  likeCount: number
  repostCount: number
  likedByMe: boolean
  repostedByMe: boolean
  canEdit: boolean
  canDelete: boolean
}

function updateTrendingPost(
  queryClient: ReturnType<typeof useQueryClient>,
  game: string | null,
  postId: string,
  updater: (p: TimelinePost) => TimelinePost
) {
  queryClient.setQueryData(
    ['timeline', 'trending', game ?? null],
    (old: { pages: { posts: TimelinePost[]; nextCursor: string | null; totalLikes?: number }[] } | undefined) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) => (p.id === postId ? updater(p) : p)),
        })),
      }
    }
  )
}

export default function TrendingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const game = searchParams.get('game') || undefined
  const queryClient = useQueryClient()

  const { data: gamesData } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.games.getAll(),
  })
  const games = gamesData?.games ?? []

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['timeline', 'trending', game ?? null],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.timeline.trending(pageParam, game),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'trending'] })
      updateTrendingPost(queryClient, game ?? null, postId, (p) => ({
        ...p,
        likedByMe: true,
        likeCount: p.likeCount + 1,
      }))
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
  })
  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unlike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'trending'] })
      updateTrendingPost(queryClient, game ?? null, postId, (p) => ({
        ...p,
        likedByMe: false,
        likeCount: Math.max(0, p.likeCount - 1),
      }))
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
  })
  const repostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.repost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'trending'] })
      updateTrendingPost(queryClient, game ?? null, postId, (p) => ({
        ...p,
        repostedByMe: true,
        repostCount: p.repostCount + 1,
      }))
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
  })
  const unrepostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unrepost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'trending'] })
      updateTrendingPost(queryClient, game ?? null, postId, (p) => ({
        ...p,
        repostedByMe: false,
        repostCount: Math.max(0, p.repostCount - 1),
      }))
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', 'trending'] })
    },
  })

  const handleEditPost = useCallback(
    async (postId: string, content: string) => {
      const { post } = await api.posts.update(postId, { content })
      updateTrendingPost(queryClient, game ?? null, postId, () => post)
    },
    [game, queryClient]
  )
  const handleDeletePost = useCallback(
    async (postId: string) => {
      await api.posts.delete(postId)
      updateTrendingPost(queryClient, game ?? null, postId, (p) => ({
        ...p,
        content: null,
        deleted: true,
        canEdit: false,
        canDelete: false,
      }))
    },
    [game, queryClient]
  )

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const posts = data?.pages.flatMap((p) => p.posts) ?? []
  const firstPage = data?.pages[0] as
    | { posts: TimelinePost[]; totalLikes?: number; lastUpdated?: string }
    | undefined
  const totalLikesSum = posts.reduce((sum, p) => sum + p.likeCount, 0)
  const stats =
    posts.length > 0
      ? {
          hotClipsCount: posts.length,
          totalLikes: totalLikesSum,
          lastUpdated: firstPage?.lastUpdated ?? new Date().toISOString(),
        }
      : null

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile game filter */}
      <div className="md:hidden overflow-x-auto border-b border-gray-800 px-4 py-2 flex gap-2 shrink-0">
        {games.map((g: { id: string; name: string; slug: string }) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSearchParams(g.slug === game ? {} : { game: g.slug })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              game === g.slug ? 'text-[#0D0D0D]' : 'text-gray-400 hover:text-white bg-gray-800/50'
            }`}
            style={game === g.slug ? { backgroundColor: '#EF8C60' } : undefined}
          >
            {g.name}
          </button>
        ))}
        {game && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="shrink-0 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white bg-gray-800/50 border border-gray-700"
          >
            Clear
          </button>
        )}
      </div>
      {/* Game filter sidebar (desktop) */}
      <aside className="w-48 shrink-0 border-r border-gray-800 p-4 hidden md:block">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Filter by game</h3>
        <ul className="space-y-1">
          {games.map((g: { id: string; name: string; slug: string; color?: string }) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => setSearchParams(g.slug === game ? {} : { game: g.slug })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  game === g.slug
                    ? 'text-[#0D0D0D] font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                style={
                  game === g.slug
                    ? { backgroundColor: '#EF8C60' }
                    : undefined
                }
              >
                {g.name}
              </button>
            </li>
          ))}
        </ul>
        {game && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="mt-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-700"
          >
            Clear
          </button>
        )}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
          <h1 className="text-xl font-bold text-white">Trending Clips</h1>
          {stats && (
            <p className="text-sm text-gray-400 mt-0.5">
              {stats.hotClipsCount} hot clips · {stats.totalLikes} total likes · updated{' '}
              {formatDistanceToNow(new Date(stats.lastUpdated), { addSuffix: true })}
            </p>
          )}
        </div>

        <div className="divide-y divide-gray-800">
          {isLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </>
          )}
          {isError && (
            <div className="p-4 text-center text-red-400">
              Failed to load trending. Please try again.
            </div>
          )}
          {!isLoading && !isError && posts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No trending clips yet. Post with a game tag to appear here.
            </div>
          )}
          {!isLoading &&
            !isError &&
            posts.map((post, index) => (
              <div key={post.id} className="relative">
                <span
                  className="absolute left-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#EF8C60] text-[#0D0D0D]"
                  aria-hidden
                >
                  #{index + 1}
                </span>
                <div className="pl-14">
                  <PostCard
                    post={post}
                    onLike={() => (post.likedByMe ? unlikeMutation.mutate(post.id) : likeMutation.mutate(post.id))}
                    onRepost={() =>
                      post.repostedByMe ? unrepostMutation.mutate(post.id) : repostMutation.mutate(post.id)
                    }
                    onReply={() => navigate(`/p/${post.id}`)}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                </div>
              </div>
            ))}
          {isFetchingNextPage && (
            <div className="p-4">
              {[...Array(2)].map((_, i) => (
                <PostCardSkeleton key={`next-${i}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
