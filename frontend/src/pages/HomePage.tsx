import Feed from '../components/Feed'
import PostComposer from '../components/PostComposer'

export default function HomePage() {
  return (
    <>
      <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </div>
      <PostComposer />
      <Feed type="home" />
    </>
  )
}
