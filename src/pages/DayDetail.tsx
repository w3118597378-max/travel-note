import { useParams, useNavigate } from 'react-router-dom'
import { useTripStore } from '@/hooks/useTripStore'
import { SectionTitle } from '@/components/common/SectionTitle'
import { AttractionCard } from '@/components/cards/AttractionCard'
import { RestaurantCard } from '@/components/cards/RestaurantCard'
import { TransportCard } from '@/components/cards/TransportCard'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { DayTabs } from '@/components/layout/DayTabs'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddCardForm } from '@/components/forms/AddCardForm'

export function DayDetail() {
  const { dayNumber } = useParams<{ dayNumber: string }>()
  const navigate = useNavigate()
  const activeTrip = useTripStore((s) => s.getActiveTrip())
  const addCard = useTripStore((s) => s.addCard)
  const removeCard = useTripStore((s) => s.removeCard)
  const [showAddForm, setShowAddForm] = useState(false)
  const numeric = Number(dayNumber)
  const day =
    activeTrip?.days.find((d: any) => d.dayNumber === numeric) ?? activeTrip?.days[0]

  if (!activeTrip || !day) return null

  return (
    <div className="space-y-4">
      <DayTabs currentDay={day.dayNumber} mode="detail" />

      <section className="flex items-baseline justify-between pt-2">
        <div>
          <p className="text-[11px] text-ink/60">
            第 {day.dayNumber} 天 · {day.date}
          </p>
          <p className="text-sm font-medium text-ink mt-0.5">
            {day.title}
          </p>
        </div>
        <p className="text-[11px] text-ink/60">{day.region}</p>
      </section>

      <WeatherWidget
        lat={day.weatherLat}
        lng={day.weatherLng}
        date={day.date}
        label={day.region}
      />

      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>行程時間軸</SectionTitle>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-vermillion/10 text-vermillion rounded-full text-[10px] font-bold"
          >
            <Plus className="h-3 w-3" /> 新增项目
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-[10px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {day.cards.map((card) => (
              <div key={card.id} className="relative flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-2 w-2 rounded-full border border-vermillion bg-paper" />
                  <span className="mt-1 text-[10px] text-ink/60">
                    {card.time}
                  </span>
                </div>
                <div className="flex-1 group relative">
                  {card.type === 'attraction' && <AttractionCard card={card} />}
                  {card.type === 'restaurant' && <RestaurantCard card={card} />}
                  {card.type === 'transport' && <TransportCard card={card} />}
                  <button
                    onClick={() => removeCard(activeTrip.id, day.dayNumber, card.id)}
                    className="absolute -right-2 -top-2 p-1.5 bg-paper border border-border rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity text-ink/20 hover:text-vermillion hover:border-vermillion/30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAddForm && (
        <AddCardForm
          onAdd={(card) => addCard(activeTrip.id, day.dayNumber, card)}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

