import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import GameTagSelector from './GameTagSelector'

interface PostComposerProps {
  onSuccess?: () => void
  placeholder?: string
}

export default function PostComposer({ onSuccess, placeholder = "What's happening?" }: PostComposerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [gameTag, setGameTag] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPostMutation = useMutation({
    mutationFn: api.posts.create,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'home'] })
      const previousData = queryClient.getQueryData(['timeline', 'home'])
      
      // Optimistically add the post
      queryClient.setQueryData(['timeline', 'home'], (old: any) => {
        if (!old) return old
        const optimisticPost = {
          id: 'temp-' + Date.now(),
          content: newPost.content,
          gameTag: newPost.gameTag ?? null,
          createdAt: new Date().toISOString(),
          author: {
            id: user!.id,
            username: user!.username,
            displayName: user!.displayName,
            avatarUrl: user!.avatarUrl,
          },
          replyCount: 0,
          likeCount: 0,
          repostCount: 0,
          likedByMe: false,
          repostedByMe: false,
          canEdit: true,
          canDelete: true,
        }
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) => 
            idx === 0 
              ? { ...page, posts: [optimisticPost, ...page.posts] }
              : page
          ),
        }
      })
      
      return { previousData }
    },
    onSuccess: (data) => {
      // Replace optimistic post with real one
      queryClient.setQueryData(['timeline', 'home'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => 
              post.id.startsWith('temp-') ? data.post : post
            ),
          })),
        }
      })
      setContent('')
      setGameTag(null)
      onSuccess?.()
    },
    onError: (_err, _newPost, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['timeline', 'home'], context.previousData)
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length === 0 || content.length > 280) return
    
    setIsSubmitting(true)
    try {
      await createPostMutation.mutateAsync({ content: content.trim(), gameTag: gameTag ?? undefined })
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  const remaining = 280 - content.length
  const isOverLimit = content.length > 280

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
            />
            <GameTagSelector value={gameTag} onChange={setGameTag} className="mt-2" />
            <div className="flex items-center justify-between mt-3">
              <div className={`text-sm ${isOverLimit ? 'text-red-500' : remaining < 20 ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                {remaining}
              </div>
              <button
                type="submit"
                disabled={content.trim().length === 0 || content.length > 280 || isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
