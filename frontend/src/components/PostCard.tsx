import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

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
  /** When true, hide action row (reply, like, repost, share) and edit/delete menu. */
  readOnly?: boolean
}

export default function PostCard({ post, onLike, onRepost, onReply, onEdit, onDelete, readOnly }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const isDeleted = post.deleted || post.content == null

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

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

  return (
    <article className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex gap-3">
        <Link to={`/u/${post.author.username}`}>
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            className="w-12 h-12 rounded-full"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/u/${post.author.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {post.author.displayName}
            </Link>
            <Link
              to={`/u/${post.author.username}`}
              className="text-gray-500 dark:text-gray-400 hover:underline"
            >
              @{post.author.username}
            </Link>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <Link
              to={`/p/${post.id}`}
              className="text-gray-500 dark:text-gray-400 hover:underline"
            >
              {timeAgo}
            </Link>
            {(post.gameTag || post.game) && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: (post.game?.color || '#EF8C60') + '30', color: post.game?.color || '#EF8C60' }}
              >
                {post.game?.name ?? post.gameTag}
              </span>
            )}
            {(post.canEdit || post.canDelete) && !isDeleted && !readOnly && (
              <div className="ml-auto relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label="More options"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {post.canEdit && (
                      <button
                        onClick={handleStartEdit}
                        className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Edit
                      </button>
                    )}
                    {post.canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{editContent.length}/500</span>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim() || editContent.length > 500}
                  className="px-3 py-1.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:underline text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {post.gameTag && (
                <Link
                  to={`/explore?game=${encodeURIComponent(post.gameTag)}`}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 transition-colors"
                  style={{ backgroundColor: 'var(--primary)', color: '#0D0D0D' }}
                >
                  #{post.gameTag}
                </Link>
              )}
              <Link to={`/p/${post.id}`} className="block">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {isDeleted ? (
                    <span className="italic text-gray-500 dark:text-gray-400">This post has been deleted.</span>
                  ) : (
                    post.content
                  )}
                </p>
              </Link>
            </>
          )}
          {!editing && !readOnly && (
            <div className="flex items-center gap-6 mt-3 text-gray-500 dark:text-gray-400">
              <button
                onClick={onReply}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.replyCount}</span>
              </button>
              <button
                onClick={onRepost}
                className={`flex items-center gap-2 hover:text-primary transition-colors ${
                  post.repostedByMe ? 'text-primary' : ''
                }`}
                aria-label={post.repostedByMe ? 'Unrepost' : 'Repost'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{post.repostCount}</span>
              </button>
              <button
                onClick={onLike}
                className={`flex items-center gap-2 hover:text-primary transition-colors ${
                  post.likedByMe ? 'text-primary' : ''
                }`}
                aria-label={post.likedByMe ? 'Unlike' : 'Like'}
              >
                <svg
                  className="w-5 h-5"
                  fill={post.likedByMe ? 'var(--primary)' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likeCount}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
