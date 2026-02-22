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
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          value === null
            ? 'bg-[#EF8C60] text-[#0D0D0D]'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
        }`}
      >
        No game
      </button>
      {games.map((g: { id: string; name: string; slug: string; color?: string }) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(value === g.slug ? null : g.slug)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            value === g.slug ? 'text-[#0D0D0D]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          style={value === g.slug ? { backgroundColor: g.color || '#EF8C60' } : undefined}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
