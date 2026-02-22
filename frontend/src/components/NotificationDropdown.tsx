import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
      return <Heart className="w-4 h-4 text-like" fill="currentColor" />
    case 'REPOST':
      return <Repeat2 className="w-4 h-4 text-repost" />
    case 'REPLY':
      return <MessageCircle className="w-4 h-4 text-reply" fill="currentColor" />
    case 'FOLLOW':
      return <UserPlus className="w-4 h-4 text-accent" />
    default:
      return null
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
      className="absolute right-0 top-full mt-1 z-50 w-[320px] rounded-xl border border-border-default bg-secondary shadow-xl overflow-hidden"
    >
      <div className="p-2 border-b border-border-default flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Notifications</span>
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-medium text-accent hover:underline"
        >
          View all notifications
        </Link>
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-secondary text-sm text-center">No notifications yet.</p>
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
                className={`flex gap-2 p-2 rounded-lg transition-colors hover:bg-hover ${
                  !n.read ? 'bg-accent/5' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={n.actor?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=user'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-border-default"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center border border-border-default">
                    <NotificationIcon type={n.type} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-primary text-xs">
                    <span className="font-semibold text-primary">{name}</span>{' '}
                    <span className="text-secondary">{actionText(n)}</span>
                  </p>
                  <p className="text-[10px] text-tertiary mt-0.5">
                    {formatConciseTime(new Date(n.createdAt))}
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
