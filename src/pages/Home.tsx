import { Link } from 'react-router-dom'
import { useTripStore } from '@/hooks/useTripStore'
import { SectionTitle } from '@/components/common/SectionTitle'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { AttractionCard } from '@/components/cards/AttractionCard'
import { RestaurantCard } from '@/components/cards/RestaurantCard'
import { TransportCard } from '@/components/cards/TransportCard'
import { DayTabs } from '@/components/layout/DayTabs'
import { Settings, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddCardForm } from '@/components/forms/AddCardForm'

export function Home() {
  const activeTrip = useTripStore((s) => s.getActiveTrip())
  const currentDayNumber = useTripStore((s) => s.currentDayNumber)
  const addCard = useTripStore((s) => s.addCard)
  const removeCard = useTripStore((s) => s.removeCard)
  const [showAddForm, setShowAddForm] = useState(false)

  if (!activeTrip) return null

  const day = activeTrip.days.find((d) => d.dayNumber === currentDayNumber) ?? activeTrip.days[0]

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-ink/40 space-y-4">
        <p>此行程尚無內容</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2.5 bg-vermillion text-white rounded-full font-semibold shadow-premium"
        >
          開始添加第一筆行程
        </button>
        {showAddForm && (
          <AddCardForm
            onAdd={(card) => addCard(activeTrip.id, 1, card)}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-ink/60">
            第 {day.dayNumber} 天 / 共 {activeTrip.totalDays} 天
          </span>
          <p className="mt-0.5 text-sm font-medium text-ink">
            {day.title}
          </p>
        </div>
        <Link
          to="/trips"
          className="p-2 rounded-full hover:bg-paper transition-colors"
          aria-label="切换行程"
        >
          <Settings className="h-5 w-5 text-ink/40" />
        </Link>
      </section>

      <DayTabs currentDay={day.dayNumber} />

      <WeatherWidget
        lat={day.weatherLat}
        lng={day.weatherLng}
        date={day.date}
        label={day.region}
      />

      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>今日行程</SectionTitle>
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

      <Link
        to={`/day/${day.dayNumber}`}
        className="mt-6 flex w-full items-center justify-center rounded-[2rem] bg-paper border border-vermillion py-3.5 text-sm font-semibold text-vermillion shadow-premium transition-all active:scale-[0.98]"
      >
        查看第 {day.dayNumber} 天完整行程
      </Link>

      {showAddForm && (
        <AddCardForm
          onAdd={(card) => addCard(activeTrip.id, day.dayNumber, card)}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
