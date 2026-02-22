export default function PostCardSkeleton() {
  return (
    <article className="border-b border-border-default p-4">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-tertiary animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-24 bg-tertiary rounded animate-pulse" />
            <div className="h-4 w-20 bg-tertiary rounded animate-pulse" />
            <div className="h-4 w-16 bg-tertiary rounded animate-pulse" />
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-tertiary rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-6">
            <div className="h-5 w-12 bg-tertiary rounded animate-pulse" />
            <div className="h-5 w-12 bg-tertiary rounded animate-pulse" />
            <div className="h-5 w-12 bg-tertiary rounded animate-pulse" />
            <div className="h-5 w-12 bg-tertiary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </article>
  )
}
