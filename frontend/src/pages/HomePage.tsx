import Feed from '../components/Feed'
import PostComposer from '../components/PostComposer'

export default function HomePage() {
  return (
    <>
      <div className="sticky top-0 bg-primary/95 backdrop-blur-sm border-b border-border-default px-4 py-3 z-10">
        <h1 className="text-page-title text-primary">Home</h1>
      </div>
      <PostComposer />
      <Feed type="home" />
    </>
  )
}
