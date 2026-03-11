import { useNavigate } from 'react-router-dom'
import { useTripStore } from '@/hooks/useTripStore'

interface DayTabsProps {
    currentDay: number
    onDayChange?: (day: number) => void
    mode?: 'home' | 'detail'
}

export function DayTabs({ currentDay, onDayChange, mode = 'home' }: DayTabsProps) {
    const activeTrip = useTripStore((s) => s.getActiveTrip())
    const setCurrentDay = useTripStore((s) => s.setCurrentDay)
    const navigate = useNavigate()

    if (!activeTrip || !activeTrip.days.length) return null

    const handleDayClick = (dayNum: number) => {
        if (onDayChange) {
            onDayChange(dayNum)
        } else {
            setCurrentDay(dayNum)
            if (mode === 'detail') {
                navigate(`/day/${dayNum}`)
            }
        }
    }

    return (
        <div className="flex overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide no-scrollbar">
            <div className="flex gap-2">
                {activeTrip.days.map((day) => {
                    const active = day.dayNumber === currentDay
                    return (
                        <button
                            key={day.dayNumber}
                            onClick={() => handleDayClick(day.dayNumber)}
                            className={`flex h-10 w-20 flex-shrink-0 flex-col items-center justify-center rounded-2xl border transition-all ${active
                                ? 'bg-vermillion border-vermillion text-white shadow-soft'
                                : 'bg-card border-border text-ink/60'
                                }`}
                        >
                            <span className="text-[10px] font-medium opacity-70">DAY</span>
                            <span className="text-sm font-bold">{day.dayNumber}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
