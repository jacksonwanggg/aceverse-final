import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../lib/api'

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

function NotificationRow({ n }: { n: NotificationItem }) {
  const linkTo = n.type === 'FOLLOW'
    ? (n.actor ? `/u/${n.actor.username}` : '#')
    : n.postId ? `/p/${n.postId}` : '#'
  const name = n.actor?.displayName || n.actor?.username || 'Someone'

  return (
    <Link
      to={linkTo}
      className={`flex gap-3 p-3 rounded-lg transition-colors hover:bg-hover ${
        !n.read ? 'bg-accent/5' : ''
      }`}
    >
      <img
        src={n.actor?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
        alt=""
        className="w-10 h-10 rounded-full object-cover shrink-0 border border-border-default"
      />
      <div className="min-w-0 flex-1">
        <p className="text-primary text-sm">
          <span className="font-semibold text-primary">{name}</span>{' '}
          <span className="text-secondary">{actionText(n)}</span>
        </p>
        <p className="text-xs text-tertiary mt-0.5">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
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
        <h1 className="text-2xl font-bold text-primary">Notifications</h1>
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
            <div key={i} className="flex gap-3 p-3 rounded-lg animate-pulse">
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
