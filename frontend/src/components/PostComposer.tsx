import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface PostComposerProps {
  onSuccess?: () => void
  placeholder?: string
}

export default function PostComposer({ onSuccess, placeholder = "What's happening?" }: PostComposerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPostMutation = useMutation({
    mutationFn: api.posts.create,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ['timeline'] })
      return { previousTimeline: queryClient.getQueryData(['timeline']) }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      setContent('')
      onSuccess?.()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length === 0 || content.length > 280) return
    
    setIsSubmitting(true)
    try {
      await createPostMutation.mutateAsync({ content: content.trim() })
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
