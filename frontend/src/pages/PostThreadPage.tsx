import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.posts.getById(postId!),
    enabled: !!postId,
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

  return (
    <div className="border-b border-gray-800">
      <PostCard post={postForCard} readOnly={readOnly} />
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
