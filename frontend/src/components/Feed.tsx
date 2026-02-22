import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface FeedProps {
  type: 'home' | 'explore'
}

export default function Feed({ type }: FeedProps) {
  const { user } = useAuth()
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['timeline', type],
    queryFn: ({ pageParam }) => {
      if (type === 'home') {
        return api.timeline.home(pageParam)
      }
      return api.timeline.explore(pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: type === 'explore' || !!user,
  })

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

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        {type === 'home' ? (
          <div>
            <p className="text-lg font-semibold mb-2">Welcome to AceVerse!</p>
            <p>Your home feed is empty. Follow some users to see their posts here.</p>
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
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {hasNextPage && (
        <div className="p-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 text-primary hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
