import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tripData, type TripData, type DayItinerary, createEmptyTrip } from '@/data/itinerary'

interface TripState {
  trips: TripData[]
  activeTripId: string | null
  currentDayNumber: number
  setTrips: (trips: TripData[]) => void
  addTrip: (trip: TripData) => void
  updateTrip: (id: string, updates: Partial<TripData>) => void
  selectTrip: (id: string | null) => void
  setCurrentDay: (day: number) => void
  getActiveTrip: () => TripData | null
  getActiveDay: (dayNumber: number) => DayItinerary | undefined
  addCard: (tripId: string, dayNumber: number, card: any) => void
  removeCard: (tripId: string, dayNumber: number, cardId: string) => void
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [tripData],
      activeTripId: 'japan-trip-2025', // Initial ID for the hardcoded trip
      currentDayNumber: 1,
      setTrips: (trips) => set({ trips }),
      addTrip: (trip) => set({ trips: [...get().trips, trip] }),
      updateTrip: (id, updates) => set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      selectTrip: (id) => set({ activeTripId: id, currentDayNumber: 1 }),
      setCurrentDay: (day) => set({ currentDayNumber: day }),
      getActiveTrip: () => {
        const { trips, activeTripId } = get()
        return trips.find((t) => t.id === activeTripId) || trips[0] || null
      },
      getActiveDay: (dayNumber) => {
        const trip = get().getActiveTrip()
        return trip?.days.find((d) => d.dayNumber === dayNumber)
      },
      addCard: (tripId, dayNumber, card) => {
        const { trips } = get()
        const newTrips = trips.map(t => {
          if (t.id !== tripId) return t
          return {
            ...t,
            days: t.days.map(d => {
              if (d.dayNumber !== dayNumber) return d
              return { ...d, cards: [...d.cards, card] }
            })
          }
        })
        set({ trips: newTrips })
      },
      removeCard: (tripId, dayNumber, cardId) => {
        const { trips } = get()
        const newTrips = trips.map(t => {
          if (t.id !== tripId) return t
          return {
            ...t,
            days: t.days.map(d => {
              if (d.dayNumber !== dayNumber) return d
              return { ...d, cards: d.cards.filter(c => c.id !== cardId) }
            })
          }
        })
        set({ trips: newTrips })
      }
    }),
    {
      name: 'travel-trips-storage'
    }
  )
)

