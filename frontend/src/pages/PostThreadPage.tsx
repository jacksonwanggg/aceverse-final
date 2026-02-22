import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

interface ReplyShape {
  id: string
  postId: string
  parentReplyId: string | null
  content: string | null
  deleted: boolean
  createdAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string } | null
  canEdit: boolean
  canDelete: boolean
}

interface PostThreadPageProps {
  readOnly?: boolean
}

export default function PostThreadPage({ readOnly }: PostThreadPageProps) {
  const { postId } = useParams<{ postId: string }>()
  const queryClient = useQueryClient()
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

  if (!postId) {
    return (
      <div className="p-4 text-gray-400">Missing post ID.</div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#EF8C60] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 text-gray-400">
        {error instanceof Error ? error.message : 'Post not found.'}
      </div>
    )
  }

  const { post, replies } = data
  const sortedReplies = [...(replies || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const postForCard = {
    ...post,
    replyCount: post.replyCount ?? (replies?.length ?? 0),
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
    <div className="border-b border-gray-800">
      <PostCard post={postForCard} readOnly={readOnly} {...likeHandlers} />
      <div className="border-t border-gray-800">
        {sortedReplies.map((reply: ReplyShape) => (
          <ReplyRow key={reply.id} reply={reply} />
        ))}
      </div>
    </div>
  )
}

function ReplyRow({ reply }: { reply: ReplyShape }) {
  const isDeleted = reply.deleted || reply.content == null
  const timeAgo = formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })

  return (
    <article className="border-b border-gray-800/50 p-4 pl-4 md:pl-16 hover:bg-gray-800/30 transition-colors">
      <div className="flex gap-3">
        {reply.author ? (
          <Link to={`/u/${reply.author.username}`}>
            <img
              src={reply.author.avatarUrl}
              alt={reply.author.displayName}
              className="w-10 h-10 rounded-full"
            />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {reply.author && (
              <>
                <Link
                  to={`/u/${reply.author.username}`}
                  className="font-semibold text-gray-100 hover:underline"
                >
                  {reply.author.displayName}
                </Link>
                <Link
                  to={`/u/${reply.author.username}`}
                  className="text-gray-500 hover:underline"
                >
                  @{reply.author.username}
                </Link>
              </>
            )}
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-gray-100 whitespace-pre-wrap break-words">
            {isDeleted ? (
              <span className="italic text-gray-500">This reply was deleted.</span>
            ) : (
              reply.content
            )}
          </p>
        </div>
      </div>
    </article>
  )
}
