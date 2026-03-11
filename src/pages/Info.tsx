import { useState } from 'react'
import { useTripStore } from '@/hooks/useTripStore'
import { SectionTitle } from '@/components/common/SectionTitle'
import { NavigateButton } from '@/components/widgets/NavigateButton'
type TabId = 'flights' | 'hotels' | 'emergency'

export function Info() {
  const activeTrip = useTripStore((s) => s.getActiveTrip())
  const [tab, setTab] = useState<TabId>('flights')

  if (!activeTrip) return null
  const trip = activeTrip

  return (
    <div className="space-y-4">
      <SectionTitle>旅行资讯</SectionTitle>

      <div className="flex gap-2 p-1 bg-paper/50 rounded-2xl border border-border/50">
        {(
          [
            { id: 'flights' as const, label: '航班', icon: '✈' },
            { id: 'hotels' as const, label: '住宿', icon: '🏨' },
            { id: 'emergency' as const, label: '緊急聯絡', icon: '🆘' }
          ] as const
        ).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${tab === id
              ? 'bg-vermillion text-white shadow-soft scale-[1.02]'
              : 'text-ink/60 hover:text-ink hover:bg-paper'
              }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'flights' && (
        <div className="space-y-3">
          {trip.flightInfo.length === 0 ? (
            <p className="text-[11px] text-ink/50">尚无航班资讯</p>
          ) : (
            trip.flightInfo.map((f) => (
              <div
                key={f.id}
                className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4"
              >
                <p className="text-[11px] text-ink/60 mb-1">
                  {f.route.includes('→') && f.route.split('→')[0].includes('TPE') ? '去程' : '回程'}
                </p>
                <p className="text-sm font-medium text-ink">
                  {f.airline} {f.flightNo} · {f.route}
                </p>
                <p className="mt-1 text-[11px] text-ink/60">
                  {f.departure} → {f.arrival}
                  {f.terminal ? ` · ${f.terminal}` : ''}
                </p>
                {f.bookingRef && (
                  <p className="mt-0.5 text-[10px] text-ink/50">訂位代碼 {f.bookingRef}</p>
                )}
                {f.notes && (
                  <p className="mt-0.5 text-[10px] text-ink/50">{f.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'hotels' && (
        <div className="space-y-3">
          {trip.hotelInfo.length === 0 ? (
            <p className="text-[11px] text-ink/50">尚无住宿资讯</p>
          ) : (
            trip.hotelInfo.map((h) => (
              <div
                key={h.id}
                className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4"
              >
                <p className="text-sm font-medium text-ink">{h.name}</p>
                <p className="mt-0.5 text-[11px] text-ink/60">{h.nights}</p>
                <p className="mt-0.5 text-[11px] text-ink/60">{h.address}</p>
                {h.checkIn && (
                  <p className="mt-0.5 text-[10px] text-ink/50">
                    入住 {h.checkIn} / 退房 {h.checkOut}
                  </p>
                )}
                {h.bookingRef && (
                  <p className="mt-0.5 text-[10px] text-ink/50">訂單 {h.bookingRef}</p>
                )}
                {h.notes && (
                  <p className="mt-0.5 text-[10px] text-ink/50">{h.notes}</p>
                )}
                {h.lat != null && h.lng != null && (
                  <div className="mt-3">
                    <NavigateButton
                      location={{
                        name: h.name,
                        address: h.address,
                        lat: h.lat,
                        lng: h.lng,
                        googleMapsUrl: h.googleMapsUrl
                      }}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'emergency' && (
        <div className="space-y-2">
          {trip.emergencyContacts.length === 0 ? (
            <p className="text-[11px] text-ink/50">尚无紧急联络资讯</p>
          ) : (
            trip.emergencyContacts.map((c, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-card border border-border shadow-soft px-4 py-3 flex items-center justify-between gap-3 transition-all hover:border-vermillion/30"
              >
                <div className="min-w-0">
                  <span className="text-[10px] text-vermillion font-medium">{c.category}</span>
                  <p className="text-sm font-medium text-ink mt-0.5">{c.name}</p>
                  {c.note && (
                    <p className="text-[10px] text-ink/50 mt-0.5">{c.note}</p>
                  )}
                </div>
                <a
                  href={`tel:${c.phone.replace(/\s/g, '')}`}
                  className="shrink-0 rounded-full border border-vermillion bg-card px-3 py-1.5 text-[11px] font-medium text-vermillion"
                >
                  撥打
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
