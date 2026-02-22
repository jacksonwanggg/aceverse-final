interface YouTubeEmbedProps {
  videoId: string
  className?: string
}

export default function YouTubeEmbed({ videoId, className = '' }: YouTubeEmbedProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-black ${className}`}
      style={{ paddingBottom: '56.25%' }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
