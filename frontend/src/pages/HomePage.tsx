import Feed from '../components/Feed'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home</h1>
        </div>
        <Feed type="home" />
      </div>
    </div>
  )
}
