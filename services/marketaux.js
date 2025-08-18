const API_KEY = import.meta.env.VITE_MARKETAUX_API_KEY

export function parseMarketauxResponse(json) {
  if (!json || !Array.isArray(json.data)) return []
  return json.data
    .map((item) => ({
      title: item?.title ?? '(sin título)',
      url: item?.url ?? '#',
      source: (item?.source && (item.source.name || item.source)) || 'Fuente',
      published_at: item?.published_at || null,
    }))
    .filter((x) => !!x.title && !!x.url)
}

export async function fetchNewsMX({ countries = 'mx', language = 'es', limit = 6 } = {}) {
  if (!API_KEY) return { ok: false, reason: 'NO_KEY' }
  const url = new URL('https://api.marketaux.com/v1/news/all')
  url.search = new URLSearchParams({ api_token: API_KEY, countries, language, limit: String(limit) }).toString()
  const res = await fetch(url.toString())
  if (!res.ok) return { ok: false, reason: 'HTTP_' + res.status }
  const json = await res.json()
  const normalized = parseMarketauxResponse(json)
  return { ok: true, data: normalized }
}