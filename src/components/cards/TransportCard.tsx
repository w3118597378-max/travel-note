import { ItineraryCard } from '@/data/itinerary'
import { NavigateButton } from '../widgets/NavigateButton'

interface Props {
  card: ItineraryCard
}

export function TransportCard({ card }: Props) {
  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium px-5 py-4 transition-all hover:border-vermillion/20">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-neutral-200" />
      <div className="mb-1 flex items-center justify-between text-[11px] text-ink/55">
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
          交通
        </span>
        {card.time && <span>{card.time}</span>}
      </div>
      <h3 className="text-sm font-medium text-ink leading-snug">
        {card.title}
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-ink/70">
        {card.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink/60">
        {card.cost && <span>約 {card.cost}</span>}
        {card.location && <NavigateButton location={card.location} size="xs" />}
      </div>
    </article>
  )
}

