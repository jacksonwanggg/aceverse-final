import Feed from '../components/Feed'

export default function ExplorePage() {
  return (
    <>
      <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Explore</h1>
      </div>
      <Feed type="explore" />
    </>
  )
}
