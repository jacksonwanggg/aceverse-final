import { useParams } from 'react-router-dom'

export default function PostThreadPage() {
  const { postId } = useParams()
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Thread</h1>
        <p className="text-gray-600 dark:text-gray-400">Post thread for {postId} coming soon...</p>
      </div>
    </div>
  )
}
