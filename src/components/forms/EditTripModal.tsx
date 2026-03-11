import { useState } from 'react'
import { X } from 'lucide-react'
import type { TripData } from '@/data/itinerary'

// Map common Chinese names to ISO 4217 codes
const CURRENCY_MAP: Record<string, string> = {
    '台币': 'TWD', '新台币': 'TWD', '日圆': 'JPY', '日元': 'JPY',
    '人民币': 'CNY', '美金': 'USD', '美元': 'USD', '欧元': 'EUR',
    '韩元': 'KRW', '韩币': 'KRW', '港币': 'HKD', '英镑': 'GBP',
    '泰铢': 'THB', '澳币': 'AUD', '澳元': 'AUD', '加币': 'CAD',
    '新加坡币': 'SGD', '新币': 'SGD', '瑞士法郎': 'CHF',
}

const POPULAR_CURRENCIES = [
    { code: 'JPY', label: '日圆 (JPY)' },
    { code: 'CNY', label: '人民币 (CNY)' },
    { code: 'TWD', label: '新台币 (TWD)' },
    { code: 'USD', label: '美元 (USD)' },
    { code: 'EUR', label: '欧元 (EUR)' },
    { code: 'KRW', label: '韩元 (KRW)' },
    { code: 'HKD', label: '港币 (HKD)' },
    { code: 'GBP', label: '英镑 (GBP)' },
    { code: 'AUD', label: '澳币 (AUD)' },
    { code: 'THB', label: '泰铢 (THB)' },
    { code: 'SGD', label: '新加坡币 (SGD)' },
]

function resolveCode(raw: string): string {
    const trimmed = raw.trim()
    return CURRENCY_MAP[trimmed] || trimmed.toUpperCase()
}

interface EditTripModalProps {
    trip: TripData
    onClose: () => void
    onSave: (id: string, updates: Partial<TripData>) => void
}

export function EditTripModal({ trip, onClose, onSave }: EditTripModalProps) {
    const [tripName, setTripName] = useState(trip.tripName)
    const [totalDays, setTotalDays] = useState(trip.totalDays)
    const [localCurrency, setLocalCurrency] = useState(trip.budget.localCurrency)
    const [baseCurrency, setBaseCurrency] = useState(trip.budget.baseCurrency)
    const [exchangeRate, setExchangeRate] = useState(trip.budget.exchangeRate)
    const [destinationCity, setDestinationCity] = useState(trip.days[0]?.region || '')
    const [geoLoading, setGeoLoading] = useState(false)
    const [geoError, setGeoError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGeoLoading(true)
        setGeoError('')

        // Geocode the destination city with OpenStreetMap Nominatim (free, no key!)
        let weatherLat = trip.days[0]?.weatherLat || 0
        let weatherLng = trip.days[0]?.weatherLng || 0
        if (destinationCity.trim()) {
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationCity)}&limit=1`,
                    { headers: { 'Accept-Language': 'zh-CN,zh' } }
                )
                const geoData = await geoRes.json()
                if (geoData.length > 0) {
                    weatherLat = parseFloat(geoData[0].lat)
                    weatherLng = parseFloat(geoData[0].lon)
                } else {
                    setGeoError(`找不到城市「${destinationCity}」，請換一個更精確的地名`)
                    setGeoLoading(false)
                    return
                }
            } catch {
                setGeoError('网络错误，无法获取位置，请检查网络重试')
                setGeoLoading(false)
                return
            }
        }

        // Auto-generate days array if totalDays changed
        let newDays = trip.days.map(d => ({ ...d, region: destinationCity, weatherLat, weatherLng }))
        if (totalDays > trip.days.length) {
            for (let i = trip.days.length + 1; i <= totalDays; i++) {
                newDays.push({
                    dayNumber: i,
                    date: '',
                    title: `第 ${i} 天`,
                    region: destinationCity || '未定',
                    weatherLat,
                    weatherLng,
                    cards: []
                })
            }
        } else if (totalDays < trip.days.length) {
            // Danger zone: truncated days
            if (confirm(`減少天數將刪除第 ${totalDays + 1} 天之後的所有行程，確定要繼續嗎？`)) {
                newDays = trip.days.slice(0, totalDays)
            } else {
                return
            }
        }

        onSave(trip.id, {
            tripName,
            totalDays,
            days: newDays,
            budget: {
                ...trip.budget,
                localCurrency: resolveCode(localCurrency),
                baseCurrency: resolveCode(baseCurrency),
                exchangeRate
            }
        })
        setGeoLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-[400px] bg-paper rounded-[2.5rem] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-ink">编辑行程信息</h3>
                    <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
                        <X className="h-5 w-5 text-ink/40" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40">行程名称</label>
                        <input
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            required
                            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40">目的地城市 (用于天气显示)</label>
                        <input
                            value={destinationCity}
                            onChange={(e) => setDestinationCity(e.target.value)}
                            placeholder="例如：東京、巴黎、武汉、Bangkok"
                            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                        />
                        {geoError && <p className="text-[11px] text-vermillion mt-1">{geoError}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40">总天数</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={totalDays}
                            onChange={(e) => setTotalDays(Number(e.target.value))}
                            required
                            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink/40">目的地貨幣 (支出安元)</label>
                            <select
                                value={POPULAR_CURRENCIES.find(c => c.code === resolveCode(localCurrency)) ? localCurrency : 'custom'}
                                onChange={(e) => {
                                    if (e.target.value !== 'custom') setLocalCurrency(e.target.value)
                                }}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-vermillion/50"
                            >
                                {POPULAR_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                                <option value="custom">自訂...</option>
                            </select>
                            <input
                                value={localCurrency}
                                onChange={(e) => setLocalCurrency(e.target.value)}
                                placeholder="或输入中文/代码"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-vermillion/50 mt-1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink/40">本國貨幣 (結算用)</label>
                            <select
                                value={POPULAR_CURRENCIES.find(c => c.code === resolveCode(baseCurrency)) ? baseCurrency : 'custom'}
                                onChange={(e) => {
                                    if (e.target.value !== 'custom') setBaseCurrency(e.target.value)
                                }}
                                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-vermillion/50"
                            >
                                {POPULAR_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                                <option value="custom">自訂...</option>
                            </select>
                            <input
                                value={baseCurrency}
                                onChange={(e) => setBaseCurrency(e.target.value)}
                                placeholder="或输入中文/代码"
                                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-vermillion/50 mt-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40">匯率 (1 目的地貨幣 = ? 本國貨幣)</label>
                        <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(Number(e.target.value))}
                            required
                            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={geoLoading}
                        className="w-full mt-2 py-3.5 bg-vermillion text-white rounded-full font-bold shadow-premium active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {geoLoading ? '识别城市中...' : '保存变更'}
                    </button>
                </form>
            </div>
        </div>
    )
}
