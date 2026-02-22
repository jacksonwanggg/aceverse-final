import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface GameTagSelectorProps {
  value: string | null
  onChange: (slug: string | null) => void
  className?: string
}

export default function GameTagSelector({ value, onChange, className = '' }: GameTagSelectorProps) {
  const { data } = useQuery({
    queryKey: ['games'],
    queryFn: api.games.getAll,
  })
  const games = data?.games ?? []

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          value === null
            ? 'bg-accent text-white'
            : 'bg-tertiary text-secondary hover:bg-hover hover:text-primary'
        }`}
      >
        No game
      </button>
      {games.map((g: { id: string; name: string; slug: string; color?: string }) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(value === g.slug ? null : g.slug)}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          value === g.slug ? 'text-white' : 'text-secondary hover:bg-tertiary hover:text-primary'
          }`}
          style={value === g.slug ? { backgroundColor: g.color || 'var(--color-accent)' } : undefined}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
