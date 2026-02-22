import Feed from '../components/Feed'

export default function ExplorePage() {
  return (
    <>
      <div className="sticky top-0 bg-primary/95 backdrop-blur-sm border-b border-border-default px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-primary">Explore</h1>
      </div>
      <Feed type="explore" />
    </>
  )
}
