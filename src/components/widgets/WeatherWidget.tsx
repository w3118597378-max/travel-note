import { SectionTitle } from '../common/SectionTitle'
import { useWeather } from '@/hooks/useWeather'

interface WeatherWidgetProps {
  lat: number
  lng: number
  date: string
  label: string
}

const weatherCodeMap: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: '晴天' },
  1: { icon: '🌤', label: '多雲時晴' },
  2: { icon: '⛅', label: '局部多雲' },
  3: { icon: '☁️', label: '陰天' },
  45: { icon: '🌫', label: '霧' },
  51: { icon: '🌦', label: '毛毛雨' },
  61: { icon: '🌧', label: '小雨' },
  71: { icon: '❄️', label: '小雪' },
  80: { icon: '🌧', label: '陣雨' },
  95: { icon: '⛈', label: '雷雨' }
}

export function WeatherWidget({ lat, lng, date, label }: WeatherWidgetProps) {
  const { loading, error, summary, hourly } = useWeather(lat, lng, date)

  const summaryLabel =
    summary && weatherCodeMap[summary.weatherCode]?.label
      ? weatherCodeMap[summary.weatherCode].label
      : '天气资讯'
  const summaryIcon = summary && weatherCodeMap[summary.weatherCode]?.icon
    ? weatherCodeMap[summary.weatherCode].icon
    : '☁️'

  const pickHour = (hour: number) => {
    const target = `${date}T${hour.toString().padStart(2, '0')}:00`
    const found = hourly.find((p) => p.time.startsWith(target))
    return found
  }

  const h12 = pickHour(12)
  const h15 = pickHour(15)
  const h18 = pickHour(18)

  return (
    <section className="mb-5">
      <SectionTitle>今日天气</SectionTitle>
      <div className="rounded-[2rem] bg-card shadow-premium border border-border px-5 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-border/60" />
                <div className="h-7 w-20 rounded-full bg-border/60" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-28 rounded-full bg-border/60" />
                <div className="h-4 w-28 rounded-full bg-border/40" />
                <div className="h-4 w-28 rounded-full bg-border/30" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded-full bg-border/60" />
              <div className="h-3 w-16 rounded-full bg-border/50" />
              <div className="h-3 w-16 rounded-full bg-border/40" />
            </div>
          </div>
        ) : error || !summary ? (
          <div className="text-[11px] text-ink/60">
            无法获取天气信息，请稍后再试。
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink/60">
                  {label} · {summaryLabel}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display text-3xl text-ink leading-none">
                    {summary.maxTemp}°
                  </span>
                  <span className="text-[11px] text-ink/60">
                    / {summary.minTemp}°
                  </span>
                  <span className="ml-1 text-lg">{summaryIcon}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-ink/60">
                {h12 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-vermillion/10 text-sm">
                      {weatherCodeMap[h12.weatherCode]?.icon ?? '☁️'}
                    </span>
                    <span>12:00 {Math.round(h12.temperature)}°</span>
                  </div>
                )}
                {h15 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm">
                      {weatherCodeMap[h15.weatherCode]?.icon ?? '☁️'}
                    </span>
                    <span>15:00 {Math.round(h15.temperature)}°</span>
                  </div>
                )}
                {h18 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm">
                      {weatherCodeMap[h18.weatherCode]?.icon ?? '☁️'}
                    </span>
                    <span>18:00 {Math.round(h18.temperature)}°</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-ink/60 border-t border-dashed border-border pt-2">
              <span>
                體感 {summary.maxTemp - 2}°
              </span>
              <span>
                降雨 {Math.round((h15 ?? h12 ?? h18)?.precipitationProbability ?? 0)}%
              </span>
              <span>風速 —</span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}


