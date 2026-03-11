import { useParams, Link } from 'react-router-dom'
import { useTripStore } from '@/hooks/useTripStore'
import { findCardById } from '@/lib/itinerary'
import { NavigateButton } from '@/components/widgets/NavigateButton'
import type { SpecialInfo } from '@/data/itinerary'
import { ChevronLeft, Navigation, Sparkles } from 'lucide-react'

const highlightStyles: Record<string, string> = {
  'must-eat': 'bg-red-50 border-red-200 text-red-800',
  'must-order': 'bg-orange-50 border-orange-200 text-orange-800',
  'must-buy': 'bg-purple-50 border-purple-200 text-purple-800',
  reservation: 'bg-blue-50 border-blue-200 text-blue-800',
  tip: 'bg-green-50 border-green-200 text-green-800',
  story: 'bg-amber-50 border-amber-200 text-amber-800'
}

const highlightLabels: Record<string, string> = {
  'must-eat': '必吃',
  'must-order': '必点',
  'must-buy': '必買',
  reservation: '預約',
  tip: '攻略',
  story: '故事'
}

function HighlightBlock({ info }: { info: SpecialInfo }) {
  const style = highlightStyles[info.tag] ?? 'bg-gray-50 border-gray-200 text-gray-800'
  const label = highlightLabels[info.tag] ?? '资讯'
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${style}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 italic">{label}</p>
      <p className="mt-1.5 text-xs leading-relaxed font-medium">
        {info.text}
        {info.tag === 'reservation' && info.code && (
          <span className="ml-2 font-bold underline decoration-2 underline-offset-2">{info.code}</span>
        )}
      </p>
    </div>
  )
}

export function PlaceDetail() {
  const { cardId } = useParams<{ cardId: string }>()
  const activeTrip = useTripStore((s) => s.getActiveTrip())
  const found = cardId && activeTrip ? findCardById(activeTrip, cardId) : null

  if (!found) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-vermillion">
          <ChevronLeft className="h-4 w-4" /> 返回首頁
        </Link>
        <p className="text-ink/60">找不到该景点或餐厅。</p>
      </div>
    )
  }

  const { day, card } = found
  const isAttraction = card.type === 'attraction'
  const tagLabel = card.type === 'restaurant' ? '餐厅' : '景点'

  return (
    <div className="space-y-4 pb-6">
      <Link
        to={`/day/${day.dayNumber}`}
        className="inline-flex items-center gap-1 text-[11px] text-ink/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> 返回第 {day.dayNumber} 天
      </Link>

      {/* Hero */}
      <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem] bg-border shadow-premium">
        <div className="relative aspect-[4/3] w-full">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const next = e.currentTarget.nextElementSibling as HTMLElement
                if (next) next.style.display = 'block'
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 bg-gradient-to-br from-ink/20 to-moss/30"
            aria-hidden
            style={card.imageUrl ? { display: 'none' } : undefined}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
              {card.title}
            </h1>
            {card.titleJa && (
              <p className="mt-1 text-xs text-white/80 font-medium">{card.titleJa}</p>
            )}
          </div>
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-vermillion/90 glass px-3 py-1 text-[10px] font-bold text-white shadow-lg">
              {tagLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2">
        {card.duration && (
          <span className="rounded-full bg-paper border border-border px-2.5 py-1 text-[10px] text-ink/70">
            ⏱ {card.duration}
          </span>
        )}
        {card.cost && (
          <span className="rounded-full bg-paper border border-border px-2.5 py-1 text-[10px] text-ink/70">
            💴 {card.cost}
          </span>
        )}
        {card.openHours && (
          <span className="rounded-full bg-paper border border-border px-2.5 py-1 text-[10px] text-ink/70">
            🕐 {card.openHours}
          </span>
        )}
      </div>

      {/* 導航按鈕 */}
      {card.location && (
        <NavigateButton
          location={card.location}
          size="md"
          label={`导航前往 ${card.location.name}`}
          className="w-full justify-center rounded-2xl py-3.5 shadow-premium bg-paper font-semibold"
        />
      )}

      {/* 旅遊亮點 */}
      {card.specialInfos && card.specialInfos.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-vermillion/80" />
            旅行亮点
          </h2>
          <div className="space-y-2">
            {card.specialInfos.map((info) => (
              <HighlightBlock key={`${info.tag}-${info.text}`} info={info} />
            ))}
          </div>
        </section>
      )}

      {/* 介紹 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink">介紹</h2>
        <p className="text-[11px] leading-relaxed text-ink/85 whitespace-pre-line">
          {card.description}
        </p>
      </section>

      {card.tips && card.tips.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">小貼士</h2>
          <ul className="list-inside list-disc space-y-1 text-[11px] text-ink/75">
            {card.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
