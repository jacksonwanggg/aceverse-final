import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export default function NotificationDropdown({ isOpen, onClose, anchorRef }: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => api.notifications.getAll(),
    enabled: isOpen,
  })

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      const el = e.target as Node
      if (
        anchorRef.current?.contains(el) ||
        panelRef.current?.contains(el)
      ) return
      onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  const notifications = data?.notifications?.slice(0, 5) ?? []

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-1 z-50 w-[320px] rounded-xl border border-gray-700 bg-[#1A1A1A] shadow-xl overflow-hidden"
    >
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-medium text-[var(--primary)] hover:underline"
        >
          View all notifications
        </Link>
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-gray-400 text-sm text-center">No notifications yet.</p>
        ) : (
          notifications.map((n) => {
            const linkTo = n.type === 'FOLLOW'
              ? (n.actor ? `/u/${n.actor.username}` : '#')
              : n.postId ? `/p/${n.postId}` : '#'
            const name = n.actor?.displayName || n.actor?.username || 'Someone'
            return (
              <Link
                key={n.id}
                to={linkTo}
                onClick={onClose}
                className={`flex gap-2 p-2 rounded-lg transition-colors hover:bg-gray-800/80 ${
                  !n.read ? 'bg-[var(--primary)]/5' : ''
                }`}
              >
                <img
                  src={n.actor?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-100 text-xs">
                    <span className="font-semibold text-white">{name}</span>{' '}
                    <span className="text-gray-400">{actionText(n)}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
