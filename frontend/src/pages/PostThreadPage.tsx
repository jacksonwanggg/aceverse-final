import { useParams } from 'react-router-dom'

export default function PostThreadPage() {
  const { postId } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Post Thread</h1>
      <p className="text-gray-400">Post thread for {postId} coming soon...</p>
    </div>
  )
}
