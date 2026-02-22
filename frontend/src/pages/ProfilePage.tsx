import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const { username } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Profile: {username}</h1>
      <p className="text-gray-400">Profile page coming soon...</p>
    </div>
  )
}
