import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import GameTagSelector from './GameTagSelector'
import { Image, LayoutGrid, Gamepad2, Smile, Pencil } from 'lucide-react'

interface PostComposerProps {
  onSuccess?: () => void
  placeholder?: string
}

export default function PostComposer({ onSuccess, placeholder = "What's happening in your games?" }: PostComposerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [gameTag, setGameTag] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPostMutation = useMutation({
    mutationFn: api.posts.create,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ['timeline', 'home'] })
      const previousData = queryClient.getQueryData(['timeline', 'home'])
      
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
      showToast('Post created', 'success')
      onSuccess?.()
    },
    onError: (err, _newPost, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['timeline', 'home'], context.previousData)
      }
      showToast(err?.message ?? 'Failed to create post', 'error')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length === 0 || content.length > 500) return
    
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

  return (
    <div className="border-b border-border-default p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={3}
              maxLength={500}
              className="w-full resize-none bg-transparent text-primary placeholder-secondary focus:outline-none text-lg"
            />
            {gameTag && (
              <div className="mt-2">
                <GameTagSelector value={gameTag} onChange={setGameTag} />
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
                  title="Add image (coming soon)"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
                  title="Add poll (coming soon)"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGameTag(gameTag ? null : 'valorant')}
                  className={`p-2 rounded-full transition-colors ${gameTag ? 'text-accent bg-accent/10' : 'text-accent hover:bg-accent/10'}`}
                  title="Add game tag"
                >
                  <Gamepad2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
                  title="Add emoji (coming soon)"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${content.length > 480 ? 'text-red-500' : content.length > 400 ? 'text-accent' : 'text-secondary'}`}>
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  disabled={content.trim().length === 0 || content.length > 500 || isSubmitting}
                  className="px-5 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
