import type { SpecialInfo } from '@/data/itinerary'

const tagStyles: Record<string, string> = {
  'must-eat': 'bg-red-100 text-red-700 border-red-200',
  'must-order': 'bg-orange-100 text-orange-700 border-orange-200',
  'must-buy': 'bg-purple-100 text-purple-700 border-purple-200',
  reservation: 'bg-blue-100 text-blue-700 border-blue-200',
  tip: 'bg-green-100 text-green-700 border-green-200',
  story: 'bg-amber-100 text-amber-700 border-amber-200'
}

const tagEmoji: Record<string, string> = {
  'must-eat': '🍜',
  'must-order': '📋',
  'must-buy': '🛍️',
  reservation: '📅',
  tip: '💡',
  story: '📖'
}

interface Props {
  infos?: SpecialInfo[]
  className?: string
}

export function TagBadgeList({ infos, className }: Props) {
  if (!infos?.length) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ''}`}>
      {infos.map((info) => (
        <span
          key={`${info.tag}-${info.text}`}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] ${tagStyles[info.tag] ?? ''}`}
        >
          <span>{tagEmoji[info.tag] ?? '🔖'}</span>
          <span>{info.text}</span>
          {info.tag === 'reservation' && info.code && (
            <span className="font-semibold underline">{info.code}</span>
          )}
        </span>
      ))}
    </div>
  )
}

