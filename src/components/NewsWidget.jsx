
import Card from './Card'
import { useMarketauxNews } from '../hooks/useMarketauxNews'

export default function NewsWidget() {
  const { loading, error, news } = useMarketauxNews({ countries: 'mx', language: 'es', limit: 6 })
  return (
    <Card title="Noticias Financieras de México 🇲🇽">
      {loading && <p className="text-sm text-neutral-500">Cargando noticias...</p>}
      {error && <p className="text-sm text-amber-700">{error}</p>}
      {!loading && (
        <ul className="space-y-2 text-sm">
          {news.map((n, idx) => (
            <li key={idx} className="border-t first:border-t-0 pt-2">
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                {n.title}
              </a>
              {n.source && <span className="text-neutral-500"> — {n.source}</span>}
              {n.published_at && <time className="block text-xs text-neutral-400">{new Date(n.published_at).toLocaleString()}</time>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
