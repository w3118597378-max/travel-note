import { useEffect, useState } from 'react'

interface WeatherPoint {
  time: string
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

interface UseWeatherResult {
  loading: boolean
  error?: string
  summary?: {
    minTemp: number
    maxTemp: number
    weatherCode: number
  }
  hourly: WeatherPoint[]
}

const cache = new Map<string, UseWeatherResult>()

export function useWeather(lat: number, lng: number, date: string): UseWeatherResult {
  const [state, setState] = useState<UseWeatherResult>({
    loading: true,
    hourly: []
  })

  useEffect(() => {
    if (!lat || !lng || !date) {
      setState({ loading: false, hourly: [] })
      return
    }

    const cacheKey = `${lat},${lng},${date}`
    const cached = cache.get(cacheKey)
    if (cached) {
      setState(cached)
      return
    }

    let cancelled = false

    async function fetchWeather() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: undefined }))

        const url = new URL('/api/weather', window.location.origin)
        url.searchParams.set('lat', lat.toFixed(4))
        url.searchParams.set('lng', lng.toFixed(4))
        url.searchParams.set('days', '1')

        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 8000)
        const res = await fetch(url.toString(), { signal: controller.signal })
        window.clearTimeout(timeout)

        if (!res.ok) {
          throw new Error(`weather http ${res.status}`)
        }
        const data = await res.json()

        const daily = data?.daily?.[0]
        if (!daily) {
          throw new Error('weather_no_daily')
        }

        const high = Number(daily.high)
        const low = Number(daily.low)
        const codeDay = Number(daily.codeDay ?? daily.code_day ?? daily.code ?? 0)
        const precip = Number(daily.precip ?? 0)

        const effectiveHourly: WeatherPoint[] = [12, 15, 18].map((h) => ({
          time: `${date}T${h.toString().padStart(2, '0')}:00`,
          temperature: (high + low) / 2,
          precipitationProbability: precip,
          weatherCode: codeDay
        }))

        const nextState: UseWeatherResult = {
          loading: false,
          hourly: effectiveHourly,
          summary: {
            minTemp: Math.round(low),
            maxTemp: Math.round(high),
            weatherCode: codeDay
          }
        }

        if (!cancelled) {
          cache.set(cacheKey, nextState)
          setState(nextState)
        }
      } catch (error: any) {
        if (cancelled) return
        const isAbort = String(error?.name || '').toLowerCase().includes('abort')
        const nextState: UseWeatherResult = {
          loading: false,
          error: isAbort ? 'weather_timeout' : error?.message ?? 'weather_error',
          hourly: []
        }
        cache.set(cacheKey, nextState)
        setState(nextState)
      }
    }

    fetchWeather()

    return () => {
      cancelled = true
    }
  }, [lat, lng, date])

  return state
}

