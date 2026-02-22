import { useInfiniteQuery, useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export interface TimelinePost {
  id: string
  content: string | null
  gameTag?: string | null
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

interface FeedProps {
  type: 'home' | 'explore'
}

function updatePostInTimelineCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (p: TimelinePost) => TimelinePost
) {
  ;(['home', 'explore'] as const).forEach((timelineType) => {
    queryClient.setQueryData(
      ['timeline', timelineType],
      (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
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
  })
}

export default function Feed({ type }: FeedProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: suggestionsData } = useQuery({
    queryKey: ['users', 'suggestions'],
    queryFn: () => api.users.getSuggestions(6),
    enabled: type === 'home' && !!user,
  })
  const followMutation = useMutation({
    mutationFn: (username: string) => api.users.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['timeline', 'home'] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline'] })
      const previous = {
        home: queryClient.getQueryData(['timeline', 'home']),
        explore: queryClient.getQueryData(['timeline', 'explore']),
      }
      updatePostInTimelineCache(queryClient, postId, (p) => ({
        ...p,
        likedByMe: true,
        likeCount: p.likeCount + 1,
      }))
      return { previous }
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['timeline', 'home'], context.previous.home)
        queryClient.setQueryData(['timeline', 'explore'], context.previous.explore)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unlike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline'] })
      const previous = {
        home: queryClient.getQueryData(['timeline', 'home']),
        explore: queryClient.getQueryData(['timeline', 'explore']),
      }
      updatePostInTimelineCache(queryClient, postId, (p) => ({
        ...p,
        likedByMe: false,
        likeCount: Math.max(0, p.likeCount - 1),
      }))
      return { previous }
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['timeline', 'home'], context.previous.home)
        queryClient.setQueryData(['timeline', 'explore'], context.previous.explore)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const repostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.repost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline'] })
      const previous = {
        home: queryClient.getQueryData(['timeline', 'home']),
        explore: queryClient.getQueryData(['timeline', 'explore']),
      }
      updatePostInTimelineCache(queryClient, postId, (p) => ({
        ...p,
        repostedByMe: true,
        repostCount: p.repostCount + 1,
      }))
      return { previous }
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['timeline', 'home'], context.previous.home)
        queryClient.setQueryData(['timeline', 'explore'], context.previous.explore)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const unrepostMutation = useMutation({
    mutationFn: (postId: string) => api.posts.unrepost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline'] })
      const previous = {
        home: queryClient.getQueryData(['timeline', 'home']),
        explore: queryClient.getQueryData(['timeline', 'explore']),
      }
      updatePostInTimelineCache(queryClient, postId, (p) => ({
        ...p,
        repostedByMe: false,
        repostCount: Math.max(0, p.repostCount - 1),
      }))
      return { previous }
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['timeline', 'home'], context.previous.home)
        queryClient.setQueryData(['timeline', 'explore'], context.previous.explore)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['timeline', type],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      if (type === 'home') {
        return api.timeline.home(pageParam)
      }
      return api.timeline.explore(pageParam)
    },
    getNextPageParam: (lastPage: { posts: TimelinePost[]; nextCursor: string | null }) => lastPage.nextCursor ?? undefined,
    enabled: type === 'explore' || !!user,
  })

  const handleEditPost = useCallback(
    async (postId: string, content: string) => {
      const { post } = await api.posts.update(postId, { content })
      queryClient.setQueryData(['timeline', type], (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) => (p.id === postId ? post : p)),
          })),
        }
      })
    },
    [type, queryClient]
  )

  const handleDeletePost = useCallback(
    async (postId: string) => {
      await api.posts.delete(postId)
      queryClient.setQueryData(['timeline', type], (old: { pages: { posts: TimelinePost[]; nextCursor: string | null }[] } | undefined) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === postId ? { ...p, content: null, deleted: true, canEdit: false, canDelete: false } : p
            ),
          })),
        }
      })
      showToast('Post deleted', 'success')
    },
    [type, queryClient, showToast]
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

  if (isLoading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        Failed to load feed. Please try again.
      </div>
    )
  }

  const posts = data?.pages.flatMap((page: { posts: TimelinePost[] }) => page.posts) || []
  const suggestions = suggestionsData?.users ?? []

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        {type === 'home' ? (
          <div className="max-w-md mx-auto">
            <p className="text-lg font-semibold mb-2 text-white">Your feed is empty. Follow some gamers to see their posts!</p>
            {suggestions.length > 0 && (
              <div className="mt-6 text-left">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Suggested accounts</p>
                <ul className="space-y-2">
                  {suggestions.map((u: { id: string; username: string; displayName: string; avatarUrl: string; isFollowing?: boolean }) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    >
                      <Link to={`/u/${u.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.username}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.displayName || u.username}</p>
                          <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                        </div>
                      </Link>
                      {!u.isFollowing && (
                        <button
                          type="button"
                          onClick={() => followMutation.mutate(u.username)}
                          disabled={followMutation.isPending}
                          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#EF8C60] focus:ring-offset-1 focus:ring-offset-[#0D0D0D] disabled:opacity-50 inline-flex items-center gap-1.5"
                          style={{ backgroundColor: '#EF8C60', color: '#0D0D0D' }}
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
              </div>
            )}
          </div>
        ) : (
          <p>No posts found. Be the first to post!</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-0">
        {posts.map((post) => (
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
            onReply={() => navigate(`/p/${post.id}`)}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        ))}
        {isFetchingNextPage && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}
      </div>
      {hasNextPage && !isFetchingNextPage && (
        <div className="p-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            className="px-4 py-2 text-primary hover:underline disabled:opacity-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
