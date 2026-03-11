import { Link } from 'react-router-dom'
import { ItineraryCard } from '@/data/itinerary'
import { NavigateButton } from '../widgets/NavigateButton'
import { TagBadgeList } from '../widgets/TagBadgeList'

interface Props {
  card: ItineraryCard
}

export function RestaurantCard({ card }: Props) {
  return (
    <Link to={`/place/${card.id}`} className="block">
      <article className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium transition-all active:scale-[0.98]">
        {card.imageUrl && (
          <div className="aspect-[21/9] w-full bg-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-orange-400 z-20" />
        <div className="p-5 pt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-ink/60">
            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-500">
              餐厅
            </span>
            {card.duration && <span>{card.duration}</span>}
          </div>
          <h3 className="text-sm font-semibold text-ink leading-snug">
            {card.title}
          </h3>
          {card.titleJa && (
            <p className="text-[11px] text-ink/60 mt-0.5">
              {card.titleJa}
            </p>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-ink/75 line-clamp-3">
            {card.description}
          </p>
          <TagBadgeList infos={card.specialInfos} className="mt-2" />
          <div className="mt-3 flex items-center justify-between text-[11px] text-ink/60">
            <div className="flex flex-wrap gap-2">
              {card.cost && <span>预算 {card.cost}</span>}
              {card.openHours && <span>營業 {card.openHours}</span>}
            </div>
            {card.location && (
              <NavigateButton location={card.location} size="sm" />
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

