import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { formatConciseTime } from '../lib/formatDate'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export interface ReplyShape {
  id: string
  postId: string
  parentReplyId: string | null
  content: string | null
  deleted: boolean
  createdAt: string
  updatedAt?: string | null
  author: { id: string; username: string; displayName: string; avatarUrl: string } | null
  canEdit: boolean
  canDelete: boolean
}

const MAX_REPLY_DEPTH = 6

interface PostThreadPageProps {
  readOnly?: boolean
}

export default function PostThreadPage({ readOnly }: PostThreadPageProps) {
  const { postId } = useParams<{ postId: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.posts.getById(postId!),
    enabled: !!postId,
  })

  const updatePostInCache = (updater: (p: NonNullable<typeof data>['post']) => NonNullable<typeof data>['post']) => {
    if (!postId) return
    const current = queryClient.getQueryData<NonNullable<typeof data>>(['post', postId])
    if (!current) return
    queryClient.setQueryData(['post', postId], { ...current, post: updater(current.post) })
  }

  const updateRepliesInCache = (updater: (r: ReplyShape[]) => ReplyShape[]) => {
    if (!postId) return
    const current = queryClient.getQueryData<NonNullable<typeof data>>(['post', postId])
    if (!current) return
    queryClient.setQueryData(['post', postId], { ...current, replies: updater(current.replies || []) })
  }

  const likeMutation = useMutation({
    mutationFn: (id: string) => api.posts.like(id),
    onMutate: (id) => {
      if (id !== postId || !data) return
      updatePostInCache((p) => ({ ...p, likedByMe: true, likeCount: (p.likeCount ?? 0) + 1 }))
    },
    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const unlikeMutation = useMutation({
    mutationFn: (id: string) => api.posts.unlike(id),
    onMutate: (id) => {
      if (id !== postId || !data) return
      updatePostInCache((p) => ({ ...p, likedByMe: false, likeCount: Math.max(0, (p.likeCount ?? 0) - 1) }))
    },
    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const repostMutation = useMutation({
    mutationFn: (id: string) => api.posts.repost(id),
    onMutate: (id) => {
      if (id !== postId || !data) return
      updatePostInCache((p) => ({ ...p, repostedByMe: true, repostCount: (p.repostCount ?? 0) + 1 }))
    },
    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })
  const unrepostMutation = useMutation({
    mutationFn: (id: string) => api.posts.unrepost(id),
    onMutate: (id) => {
      if (id !== postId || !data) return
      updatePostInCache((p) => ({ ...p, repostedByMe: false, repostCount: Math.max(0, (p.repostCount ?? 0) - 1) }))
    },
    onSettled: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const replyToPostMutation = useMutation({
    mutationFn: (content: string) => api.posts.reply(postId!, { content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const prev = queryClient.getQueryData<NonNullable<typeof data>>(['post', postId])
      if (!prev || !user) return { prev }
      const optimistic: ReplyShape = {
        id: 'temp-reply-' + Date.now(),
        postId: postId!,
        parentReplyId: null,
        content,
        deleted: false,
        createdAt: new Date().toISOString(),
        author: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
        canEdit: true,
        canDelete: true,
      }
      updateRepliesInCache((replies) => [...replies, optimistic])
      updatePostInCache((p) => ({ ...p, replyCount: (p.replyCount ?? 0) + 1 }))
      return { prev }
    },
    onSuccess: (result) => {
      updateRepliesInCache((replies) =>
        replies.map((r) => (r.id.startsWith('temp-reply-') ? result.reply : r))
      )
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
    onError: (_err, _content, context) => {
      if (context?.prev) queryClient.setQueryData(['post', postId], context.prev)
    },
  })

  if (!postId) {
    return (
      <div className="p-4 text-secondary">Missing post ID.</div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 text-secondary">
        {error instanceof Error ? error.message : 'Post not found.'}
      </div>
    )
  }

  const { post, replies } = data
  const repliesList = replies || []
  const replyDepth = new Map<string, number>()
  const byId = new Map(repliesList.map((r) => [r.id, r]))
  function getDepth(r: ReplyShape): number {
    const cached = replyDepth.get(r.id)
    if (cached !== undefined) return cached
    const d = r.parentReplyId == null ? 0 : 1 + getDepth(byId.get(r.parentReplyId)!)
    replyDepth.set(r.id, d)
    return d
  }
  repliesList.forEach((r) => getDepth(r))
  const sortedReplies = [...repliesList].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const postForCard = {
    ...post,
    replyCount: post.replyCount ?? repliesList.length,
  }

  const likeHandlers = readOnly
    ? {}
    : {
        onLike: () =>
          postForCard.likedByMe
            ? unlikeMutation.mutate(post.id)
            : likeMutation.mutate(post.id),
        onRepost: () =>
          postForCard.repostedByMe
            ? unrepostMutation.mutate(post.id)
            : repostMutation.mutate(post.id),
      }

  return (
    <div className="border-b border-border-default">
      <PostCard post={postForCard} readOnly={readOnly} {...likeHandlers} />
      {!readOnly && user && (
        <ReplyComposer
          placeholder="Post your reply..."
          onSubmit={(content) => replyToPostMutation.mutate(content)}
          isSubmitting={replyToPostMutation.isPending}
          className="border-t border-border-default p-4 pl-4 md:pl-16"
        />
      )}
      <div className="border-t border-border-default">
        {sortedReplies.map((reply) => (
          <ReplyRow
            key={reply.id}
            reply={reply}
            depth={Math.min(getDepth(reply), MAX_REPLY_DEPTH)}
            maxDepth={MAX_REPLY_DEPTH}
            readOnly={readOnly}
            postId={postId}
            onReplyCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['post', postId] })
              updatePostInCache((p) => ({ ...p, replyCount: (p.replyCount ?? 0) + 1 }))
            }}
            onReplyUpdated={(updated) => {
              updateRepliesInCache((replies) =>
                replies.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
              )
            }}
            onReplyDeleted={(replyId) => {
              updateRepliesInCache((replies) =>
                replies.map((r) => (r.id === replyId ? { ...r, deleted: true, content: null } : r))
              )
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ReplyComposer({
  placeholder,
  onSubmit,
  isSubmitting,
  className = '',
}: {
  placeholder: string
  onSubmit: (content: string) => void
  isSubmitting: boolean
  className?: string
}) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || trimmed.length > 500) return
    onSubmit(trimmed)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-3">
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={2}
            maxLength={500}
            className="w-full resize-none bg-secondary text-primary placeholder-tertiary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent border border-border-default"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={content.trim().length === 0 || content.length > 500 || isSubmitting}
              className="px-4 py-2 bg-accent text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

interface ReplyRowProps {
  reply: ReplyShape
  depth: number
  maxDepth: number
  readOnly?: boolean
  postId: string
  onReplyCreated: () => void
  onReplyUpdated: (updated: Partial<ReplyShape>) => void
  onReplyDeleted: (replyId: string) => void
}

function ReplyRow({ reply, depth, maxDepth, readOnly, postId, onReplyCreated, onReplyUpdated, onReplyDeleted }: ReplyRowProps) {
  const [showReplyComposer, setShowReplyComposer] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(reply.content ?? '')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const isDeleted = reply.deleted || reply.content == null
  const timeAgo = formatConciseTime(new Date(reply.createdAt))
  const indent = Math.min(depth, maxDepth) * 20

  const replyToReplyMutation = useMutation({
    mutationFn: (content: string) => api.replies.create(reply.id, { content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const prev = queryClient.getQueryData<{ post: any; replies: ReplyShape[] }>(['post', postId])
      if (!prev || !user) return { prev }
      const optimistic: ReplyShape = {
        id: 'temp-nested-' + Date.now(),
        postId,
        parentReplyId: reply.id,
        content,
        deleted: false,
        createdAt: new Date().toISOString(),
        author: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
        canEdit: true,
        canDelete: true,
      }
      queryClient.setQueryData(['post', postId], { ...prev, replies: [...prev.replies, optimistic] })
      return { prev }
    },
    onSuccess: () => {
      setShowReplyComposer(false)
      onReplyCreated()
    },
    onError: (_err, _content, context) => {
      if (context?.prev) queryClient.setQueryData(['post', postId], context.prev)
    },
  })

  const updateReplyMutation = useMutation({
    mutationFn: (content: string) => api.replies.update(reply.id, { content }),
    onMutate: () => {
      onReplyUpdated({ content: editContent })
    },
    onSuccess: (_data, content) => {
      setEditing(false)
      onReplyUpdated({ content })
    },
    onError: () => {
      onReplyUpdated({ content: reply.content })
    },
  })

  const deleteReplyMutation = useMutation({
    mutationFn: () => api.replies.delete(reply.id),
    onSuccess: () => {
      onReplyDeleted(reply.id)
    },
  })

  const handleSaveEdit = () => {
    const trimmed = editContent.trim()
    if (trimmed.length === 0 || trimmed.length > 500) return
    setSaving(true)
    updateReplyMutation.mutate(trimmed, {
      onSettled: () => setSaving(false),
    })
  }

  return (
    <article
      className="border-b border-border-default/50 p-4 hover:bg-hover transition-colors"
      style={{ marginLeft: indent }}
    >
      <div className="flex gap-3">
        {reply.author ? (
          <Link to={`/u/${reply.author.username}`}>
            <img
              src={reply.author.avatarUrl}
              alt={reply.author.displayName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-tertiary flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {reply.author && (
              <>
                <Link
                  to={`/u/${reply.author.username}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {reply.author.displayName}
                </Link>
                <Link
                  to={`/u/${reply.author.username}`}
                  className="text-tertiary hover:underline"
                >
                  @{reply.author.username}
                </Link>
              </>
            )}
            <span className="text-tertiary">·</span>
            <span className="text-tertiary">{timeAgo}</span>
            {!readOnly && (reply.canEdit || reply.canDelete) && !editing && !isDeleted && (
              <span className="ml-auto flex items-center gap-1">
                {reply.canEdit && (
                  <button
                    type="button"
                    onClick={() => { setEditing(true); setEditContent(reply.content ?? ''); }}
                    className="text-sm text-secondary hover:text-accent"
                  >
                    Edit
                  </button>
                )}
                {reply.canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteReplyMutation.mutate()}
                    className="text-sm text-secondary hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </span>
            )}
          </div>
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full resize-none bg-tertiary text-primary rounded-lg p-2 border border-border-default focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editContent.trim().length === 0 || editContent.length > 500 || saving}
                  className="px-3 py-1.5 bg-accent text-white rounded-full text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditContent(reply.content ?? ''); }}
                  className="px-3 py-1.5 text-secondary hover:text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-primary whitespace-pre-wrap break-words">
              {isDeleted ? (
                <span className="italic text-tertiary">This reply has been deleted.</span>
              ) : (
                reply.content
              )}
            </p>
          )}
          {!readOnly && user && depth < maxDepth && !editing && (
            <div className="mt-2">
              {!showReplyComposer ? (
                <button
                  type="button"
                  onClick={() => setShowReplyComposer(true)}
                  className="text-sm text-accent hover:underline"
                >
                  Reply
                </button>
              ) : (
                <ReplyComposer
                  placeholder="Reply..."
                  onSubmit={(content) => replyToReplyMutation.mutate(content)}
                  isSubmitting={replyToReplyMutation.isPending}
                  className="mt-2"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
