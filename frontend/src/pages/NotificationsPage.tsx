import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatConciseTime } from '../lib/formatDate'
import { api } from '../lib/api'
import { Heart, MessageCircle, Repeat2, UserPlus } from 'lucide-react'

type NotificationItem = {
  id: string
  type: 'LIKE' | 'REPLY' | 'REPOST' | 'FOLLOW'
  read: boolean
  createdAt: string
  postId: string | null
  replyId: string | null
  actor: { id: string; username: string; displayName: string; avatarUrl: string } | null
}

function actionText(n: NotificationItem): string {
  switch (n.type) {
    case 'LIKE':
      return 'liked your post'
    case 'REPOST':
      return 'reposted your post'
    case 'REPLY':
      return 'replied to your post'
    case 'FOLLOW':
      return 'followed you'
    default:
      return 'interacted with you'
  }
}

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'LIKE':
      return <Heart className="w-5 h-5 text-like" fill="currentColor" />
    case 'REPOST':
      return <Repeat2 className="w-5 h-5 text-repost" />
    case 'REPLY':
      return <MessageCircle className="w-5 h-5 text-reply" fill="currentColor" />
    case 'FOLLOW':
      return <UserPlus className="w-5 h-5 text-accent" />
    default:
      return null
  }
}

function NotificationRow({ n }: { n: NotificationItem }) {
  const linkTo = n.type === 'FOLLOW'
    ? (n.actor ? `/u/${n.actor.username}` : '#')
    : n.postId ? `/p/${n.postId}` : '#'
  const name = n.actor?.displayName || n.actor?.username || 'Someone'

  return (
    <Link
      to={linkTo}
      className={`flex gap-3 p-4 rounded-xl transition-colors hover:bg-hover ${
        !n.read ? 'bg-accent/5 border-l-2 border-accent' : ''
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={n.actor?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-border-default"
        />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-border-default">
          <NotificationIcon type={n.type} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary text-sm">
          <span className="font-semibold text-primary">{name}</span>{' '}
          <span className="text-secondary">{actionText(n)}</span>
        </p>
        <p className="text-xs text-tertiary mt-0.5">
          {formatConciseTime(new Date(n.createdAt))}
        </p>
      </div>
    </Link>
  )
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => api.notifications.getAll(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
  const markAllRead = useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preview'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] })
    },
  })

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? []
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-page-title-lg text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-full bg-tertiary shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-tertiary rounded w-3/4" />
                <div className="h-2 bg-secondary rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-secondary py-8 text-center">No notifications yet.</p>
      ) : (
        <>
          <div className="space-y-0.5">
            {notifications.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
