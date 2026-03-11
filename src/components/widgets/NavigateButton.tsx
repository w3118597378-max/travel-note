import type { Location } from '@/data/itinerary'
import { Navigation } from 'lucide-react'

interface NavigateButtonProps {
  location: Location
  size?: 'xs' | 'sm' | 'md'
  className?: string
  label?: string
}

const sizeClassMap: Record<NonNullable<NavigateButtonProps['size']>, string> = {
  xs: 'px-2 py-1 text-[10px]',
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-[12px]'
}

export function NavigateButton({ location, size = 'md', className, label }: NavigateButtonProps) {
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 1. Prioritize explicitly provided Google Maps URL
    if (location.googleMapsUrl) {
      window.open(location.googleMapsUrl, '_blank')
      return
    }

    // 2. Use coordinates if available
    if (location.lat && location.lng) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS && location.appleMapsUrl) {
        window.open(location.appleMapsUrl, '_blank')
        return
      }
      if (isIOS) {
        window.open(`maps://maps.apple.com/?q=${location.lat},${location.lng}`, '_blank')
      } else {
        window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`, '_blank')
      }
      return
    }

    // 3. Fallback: Search by name directly in Google Maps
    if (location.name || typeof location === 'string') {
      const query = typeof location === 'string' ? location : location.name;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
    }
  }

  return (
    <button
      type="button"
      onClick={handleNavigate}
      className={`inline-flex items-center gap-1 rounded-full bg-vermillion text-card shadow-soft ${sizeClassMap[size]} ${className ?? ''}`}
    >
      <Navigation className="h-3 w-3" />
      <span>{label ?? '导航'}</span>
    </button>
  )
}

