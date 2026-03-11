// Netlify Function: /api/weather?lat=..&lng=..&days=1
// Proxies Seniverse request server-side to improve CN accessibility and hide API key.
export async function handler(event) {
  try {
    const lat = Number(event.queryStringParameters?.lat)
    const lng = Number(event.queryStringParameters?.lng)
    const daysRaw = Number(event.queryStringParameters?.days ?? 1)
    const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 3) : 1

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'bad_request', message: 'lat/lng required' })
      }
    }

    const apiKey = process.env.SENIVERSE_KEY || process.env.VITE_SENIVERSE_KEY
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'missing_server_key' })
      }
    }

    const url = new URL('https://api.seniverse.com/v3/weather/daily.json')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('location', `${lat.toFixed(2)}:${lng.toFixed(2)}`)
    url.searchParams.set('language', 'zh-Hans')
    url.searchParams.set('unit', 'c')
    url.searchParams.set('start', '0')
    url.searchParams.set('days', String(days))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url.toString(), { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'upstream_http', status: res.status })
      }
    }

    const data = await res.json()
    const daily = data?.results?.[0]?.daily
    if (!Array.isArray(daily) || daily.length === 0) {
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'upstream_bad_payload' })
      }
    }

    // Return a minimal, stable payload for the client.
    const normalized = daily.map((d) => ({
      date: d?.date,
      high: Number(d?.high),
      low: Number(d?.low),
      codeDay: Number(d?.code_day ?? d?.code ?? 0),
      precip: Number(d?.precip ?? 0)
    }))

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // allow short caching at CDN/edge
        'cache-control': 'public, max-age=60'
      },
      body: JSON.stringify({ daily: normalized })
    }
  } catch (e) {
    const isAbort = String(e?.name || '').toLowerCase().includes('abort')
    return {
      statusCode: isAbort ? 504 : 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: isAbort ? 'upstream_timeout' : 'server_error' })
    }
  }
}

