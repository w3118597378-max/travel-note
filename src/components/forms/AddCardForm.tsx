import { useState } from 'react'
import { X, MapPin, Utensils, Car, Clock, FileText, Loader2 } from 'lucide-react'

interface AddCardFormProps {
    onAdd: (card: any) => void
    onClose: () => void
}

export function AddCardForm({ onAdd, onClose }: AddCardFormProps) {
    const [type, setType] = useState<'attraction' | 'restaurant' | 'transport'>('attraction')
    const [title, setTitle] = useState('')
    const [time, setTime] = useState('09:00')
    const [location, setLocation] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return alert('请输入名称')

        setLoading(true)
        let fetchedImageUrl = undefined
        let fetchedDescription = undefined

        try {
            if (type !== 'transport') {
                // 1. Search Wikipedia for the closest title
                const searchRes = await fetch(`https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json&origin=*`)
                const searchData = await searchRes.json()
                const firstResult = searchData?.query?.search?.[0]

                if (firstResult) {
                    // 2. Fetch the summary for the matched title (for description only)
                    const pageTitle = firstResult.title
                    const summaryRes = await fetch(`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`)
                    const summaryData = await summaryRes.json()

                    if (summaryData.extract) {
                        fetchedDescription = summaryData.extract
                    }

                    // 3. Use Official Unsplash API for high-quality, real-world scenic images
                    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
                    if (unsplashKey) {
                        try {
                            // Search for landscape photos matching the title (in English or local language, Unsplash handles some)
                            // We add 'landmark' or 'scenery' broadly, or just the title.
                            const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(pageTitle)}&orientation=landscape&per_page=1`, {
                                headers: {
                                    Authorization: `Client-ID ${unsplashKey}`
                                }
                            })
                            const unsplashData = await unsplashRes.json()
                            if (unsplashData.results && unsplashData.results.length > 0) {
                                fetchedImageUrl = unsplashData.results[0].urls.regular
                            }
                        } catch (imgErr) {
                            console.warn('Unsplash API failed, fallback to Wikipedia image', imgErr)
                        }
                    }

                    // 4. Fallback to Wikimedia Commons Search API for a REAL scenic photo (.jpg)
                    // This avoids the issue where Wikipedia's main image is an SVG logo/cartoon
                    if (!fetchedImageUrl) {
                        try {
                            const commonsRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(pageTitle)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`)
                            const commonsData = await commonsRes.json()
                            if (commonsData.query?.pages) {
                                const pages = Object.values(commonsData.query.pages) as any[]
                                // Find the first image that is a JPEG (to avoid SVG logos and weird PNG charts)
                                const validImage = pages.find(p => {
                                    const url = p.imageinfo?.[0]?.url?.toLowerCase()
                                    return url && (url.endsWith('.jpg') || url.endsWith('.jpeg'))
                                })
                                if (validImage) {
                                    fetchedImageUrl = validImage.imageinfo[0].url
                                }
                            }
                        } catch (commonsErr) {
                            console.warn('Wikimedia Commons API failed', commonsErr)
                        }
                    }

                    // 5. Ultimate fallback: Wikipedia's infobox image (might be a logo)
                    if (!fetchedImageUrl) {
                        if (summaryData.originalimage?.source) {
                            fetchedImageUrl = summaryData.originalimage.source
                        } else if (summaryData.thumbnail?.source) {
                            fetchedImageUrl = summaryData.thumbnail.source
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch rich content:', error)
            // Silently fail and just use user's input
        }

        const newCard = {
            id: crypto.randomUUID ? crypto.randomUUID() : `card-${Date.now()}`,
            type,
            title,
            time,
            location: type !== 'transport' && (location || title) ? {
                name: location || title,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || title)}`
            } : undefined,
            route: type === 'transport' ? location : undefined,
            note,
            imageUrl: fetchedImageUrl,
            description: fetchedDescription,
            ...(type === 'attraction' ? { rating: 5, tags: ['必去'] } : {}),
            ...(type === 'restaurant' ? { rating: 5, cuisine: '在地美食' } : {}),
            ...(type === 'transport' ? { transportMode: '電車' } : {})
        }

        onAdd(newCard)
        setLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-[400px] bg-paper rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-ink">新增行程项目</h3>
                    <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
                        <X className="h-5 w-5 text-ink/40" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'attraction', label: '景点', icon: MapPin },
                            { id: 'restaurant', label: '餐厅', icon: Utensils },
                            { id: 'transport', label: '交通', icon: Car }
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setType(t.id as any)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${type === t.id
                                    ? 'bg-vermillion/10 border-vermillion text-vermillion'
                                    : 'bg-card border-border text-ink/40 hover:border-ink/20'
                                    }`}
                            >
                                <t.icon className="h-5 w-5" />
                                <span className="text-[10px] font-semibold">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40 flex items-center gap-1.5">
                            <FileText className="h-3 w-3" /> 名称
                        </label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例如：東京鐵塔、一蘭拉麵"
                            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-vermillion/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink/40 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> 時間
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink/40 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" /> 地点 / 路线
                            </label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="例如：港區、新宿→上野"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vermillion/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink/40">備註 (可選)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm h-20 resize-none focus:outline-none focus:border-vermillion/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-vermillion text-white rounded-full font-bold shadow-premium active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> 正在智能获取资讯...</> : '保存行程'}
                    </button>
                </form>
            </div>
        </div>
    )
}
