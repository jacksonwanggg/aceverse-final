import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../hooks/useToast'
import { extractYouTubeVideoId } from '../lib/youtube'
import { formatConciseTime } from '../lib/formatDate'
import YouTubeEmbed from './YouTubeEmbed'
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    content: string | null
    gameTag?: string | null
    game?: { name: string; slug: string; color: string } | null
    deleted?: boolean
    createdAt: string
    author: {
      id: string
      username: string
      displayName: string
      avatarUrl: string
    }
    replyCount: number
    likeCount: number
    repostCount: number
    likedByMe: boolean
    repostedByMe: boolean
    canEdit: boolean
    canDelete: boolean
  }
  onLike?: () => void
  onRepost?: () => void
  onReply?: () => void
  onEdit?: (postId: string, content: string) => Promise<void>
  onDelete?: (postId: string) => Promise<void>
  readOnly?: boolean
}

function renderHighlightedContent(content: string): React.ReactNode {
  const parts = content.split(/(#\w+|@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return (
        <Link
          key={i}
          to={`/search?q=${encodeURIComponent(part)}`}
          className="text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      )
    }
    if (part.startsWith('@')) {
      return (
        <Link
          key={i}
          to={`/u/${part.slice(1)}`}
          className="text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      )
    }
    return part
  })
}

export default function PostCard({ post, onLike, onRepost, onReply, onEdit, onDelete, readOnly }: PostCardProps) {
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const timeAgo = formatConciseTime(new Date(post.createdAt))
  const isDeleted = post.deleted || post.content == null
  const youtubeVideoId = !isDeleted && post.content ? extractYouTubeVideoId(post.content) : null

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  // Focus and move cursor to end when entering edit mode only; editContent in deps would move cursor on every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (editing && editTextareaRef.current) {
      editTextareaRef.current.focus()
      editTextareaRef.current.setSelectionRange(editContent.length, editContent.length)
    }
  }, [editing])

  const handleStartEdit = () => {
    setEditContent(post.content ?? '')
    setEditing(true)
    setMenuOpen(false)
  }

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed || trimmed.length > 500 || !onEdit) return
    setSaving(true)
    try {
      await onEdit(post.id, trimmed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(post.content ?? '')
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!onDelete || !window.confirm('Delete this post? This cannot be undone.')) return
    setMenuOpen(false)
    setDeleting(true)
    try {
      await onDelete(post.id)
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/p/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy link', 'error')
    }
  }

  return (
    <article className="border-b border-border-default p-4 hover:bg-hover transition-colors duration-200">
      <div className="flex gap-3">
        <Link to={`/u/${post.author.username}`} className="shrink-0">
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/u/${post.author.username}`}
              className="font-semibold text-primary hover:underline truncate"
            >
              {post.author.displayName}
            </Link>
            <Link
              to={`/u/${post.author.username}`}
              className="text-secondary hover:underline truncate"
            >
              @{post.author.username}
            </Link>
            <span className="text-secondary shrink-0">·</span>
            <Link
              to={`/p/${post.id}`}
              className="text-small text-secondary hover:underline shrink-0"
            >
              {timeAgo}
            </Link>
            {(post.canEdit || post.canDelete) && !isDeleted && !readOnly && (
              <div className="ml-auto relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 rounded-full hover:bg-hover text-secondary"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-secondary border border-border-default rounded-lg shadow-lg z-10">
                    {post.canEdit && (
                      <button
                        onClick={handleStartEdit}
                        className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-hover"
                      >
                        Edit
                      </button>
                    )}
                    {post.canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-hover disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {editing ? (
            <div className="mt-1">
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-border-default rounded-lg bg-tertiary text-primary resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-secondary">{editContent.length}/500</span>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim() || editContent.length > 500}
                  className="px-3 py-1.5 bg-accent text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-3 py-1.5 text-secondary hover:underline text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to={`/p/${post.id}`} className="block">
                <p className="text-primary whitespace-pre-wrap break-words text-body leading-content">
                  {isDeleted ? (
                    <span className="italic text-secondary">This post has been deleted.</span>
                  ) : (
                    renderHighlightedContent(post.content!)
                  )}
                </p>
              </Link>
              {(post.gameTag || post.game) && !isDeleted && (
                <Link
                  to={`/trending?game=${post.game?.slug || post.gameTag}`}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mt-2 transition-colors"
                  style={{ 
                    backgroundColor: (post.game?.color || 'var(--color-accent)') + '20', 
                    color: post.game?.color || 'var(--color-accent)' 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: post.game?.color || 'var(--color-accent)' }}
                  />
                  {post.game?.name ?? post.gameTag}
                </Link>
              )}
              {youtubeVideoId && (
                <div className="mt-3">
                  <YouTubeEmbed videoId={youtubeVideoId} />
                </div>
              )}
            </>
          )}
          {!editing && !readOnly && !isDeleted && (
            <div className="flex items-center justify-between w-full mt-3 text-secondary">
              <button
                onClick={onReply}
                className="flex items-center gap-2 hover:text-reply transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                <span className="text-sm">{post.replyCount}</span>
              </button>
              <motion.button
                onClick={onRepost}
                className={`flex items-center gap-2 hover:text-repost transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded ${
                  post.repostedByMe ? 'text-repost' : ''
                }`}
                aria-label={post.repostedByMe ? 'Unrepost' : 'Repost'}
                animate={{ rotate: post.repostedByMe ? 360 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Repeat2 className="w-[18px] h-[18px]" />
                <span className="text-sm">{post.repostCount}</span>
              </motion.button>
              <motion.button
                onClick={onLike}
                className={`flex items-center gap-2 hover:text-like transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded ${
                  post.likedByMe ? 'text-like' : ''
                }`}
                aria-label={post.likedByMe ? 'Unlike' : 'Like'}
                whileTap={{ scale: 0.9 }}
                animate={post.likedByMe ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              >
                <Heart className="w-[18px] h-[18px]" fill={post.likedByMe ? 'currentColor' : 'none'} />
                <span className="text-sm">{post.likeCount}</span>
              </motion.button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
                aria-label="Share"
              >
                <Share className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
