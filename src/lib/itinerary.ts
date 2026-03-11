import type { TripData, DayItinerary, ItineraryCard } from '@/data/itinerary'

export function findCardById(
  trip: TripData,
  cardId: string
): { day: DayItinerary; card: ItineraryCard } | null {
  for (const day of trip.days) {
    const card = day.cards.find((c) => c.id === cardId)
    if (card) return { day, card }
  }
  return null
}
