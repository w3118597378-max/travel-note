import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripStore } from '@/hooks/useTripStore'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Plus, ChevronRight, MapPin, Calendar, Trash2, Edit2 } from 'lucide-react'
import { createEmptyTrip } from '@/data/itinerary'
import { EditTripModal } from '@/components/forms/EditTripModal'

export function Trips() {
    const { trips, activeTripId, selectTrip, addTrip, updateTrip, setTrips } = useTripStore()
    const navigate = useNavigate()
    const [editingTripId, setEditingTripId] = useState<string | null>(null)

    const handleCreate = () => {
        const id = `trip-${Date.now()}`
        const newTrip = createEmptyTrip(id)
        addTrip(newTrip)
        selectTrip(id)
        setEditingTripId(id) // Open editor immediately
    }

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (trips.length <= 1) return alert('至少保留一个行程')
        if (confirm('确定要删除这个行程吗？')) {
            const newTrips = trips.filter(t => t.id !== id)
            setTrips(newTrips)
            if (activeTripId === id) selectTrip(newTrips[0]?.id || null)
        }
    }

    return (
        <div className="space-y-6">
            <SectionTitle>我的行程</SectionTitle>

            <div className="grid gap-4">
                {trips.map((trip) => {
                    const isActive = activeTripId === trip.id

                    return (
                        <div
                            key={trip.id}
                            onClick={() => {
                                selectTrip(trip.id)
                                navigate('/')
                            }}
                            className={`group relative overflow-hidden rounded-[2rem] border transition-all active:scale-[0.98] ${isActive
                                ? 'border-vermillion bg-white shadow-premium'
                                : 'border-border bg-card/50 hover:border-vermillion/30'
                                }`}
                        >
                            <div className="flex items-center gap-4 p-5">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isActive ? 'bg-vermillion text-white' : 'bg-paper text-ink/40'
                                    }`}>
                                    <MapPin className="h-6 w-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate ${isActive ? 'text-ink' : 'text-ink/70'}`}>
                                        {trip.tripName}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-3 text-[10px] text-ink/40 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {trip.year}
                                        </span>
                                        <span>{trip.totalDays} 天</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTripId(trip.id)
                                        }}
                                        className="p-2 text-ink/20 hover:text-vermillion transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, trip.id)}
                                        className="p-2 text-ink/20 hover:text-vermillion transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <ChevronRight className={`h-5 w-5 ${isActive ? 'text-vermillion' : 'text-ink/20'}`} />
                                </div>
                            </div>

                            {isActive && (
                                <div className="absolute top-0 right-0 h-10 w-10 -mr-5 -mt-5 rotate-45 bg-vermillion/10" />
                            )}
                        </div>
                    )
                })}

                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-border py-8 text-ink/40 hover:border-vermillion/30 hover:text-vermillion/60 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">创建新行程</span>
                </button>
            </div>

            {editingTripId && (
                <EditTripModal
                    trip={trips.find(t => t.id === editingTripId)!}
                    onClose={() => setEditingTripId(null)}
                    onSave={(id, updates) => updateTrip(id, updates)}
                />
            )}
        </div>
    )
}
