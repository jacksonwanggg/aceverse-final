import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

interface PostCardProps {
  post: {
    id: string
    content: string
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
}

export default function PostCard({ post, onLike, onRepost, onReply }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

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
          </div>
          <Link to={`/p/${post.id}`} className="block">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </Link>
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
            >
              <svg
                className={`w-5 h-5 ${post.likedByMe ? 'fill-current' : ''}`}
                fill="none"
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
        </div>
      </div>
    </article>
  )
}
