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
        const apiKey = import.meta.env.VITE_SENIVERSE_KEY
        if (!apiKey) {
          setState({ loading: false, error: 'missing_seniverse_key', hourly: [] })
          return
        }

        setState((prev) => ({ ...prev, loading: true, error: undefined }))

        const url = new URL('https://api.seniverse.com/v3/weather/daily.json')
        url.searchParams.set('key', apiKey)
        url.searchParams.set('location', `${lat.toFixed(2)}:${lng.toFixed(2)}`)
        url.searchParams.set('language', 'zh-Hans')
        url.searchParams.set('unit', 'c')
        url.searchParams.set('start', '0')
        url.searchParams.set('days', '1')

        const res = await fetch(url.toString())
        if (!res.ok) {
          throw new Error(`weather http ${res.status}`)
        }
        const data = await res.json()

        const daily = data?.results?.[0]?.daily?.[0]
        if (!daily) {
          throw new Error('seniverse_no_daily')
        }

        const high = Number(daily.high)
        const low = Number(daily.low)
        const codeDay = Number(daily.code_day ?? daily.code ?? 0)
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
        const nextState: UseWeatherResult = {
          loading: false,
          error: error?.message ?? 'weather_error',
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

