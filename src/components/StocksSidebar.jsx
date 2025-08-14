
import Card from './Card'
import { DUMMY_MARKET } from '../services/dummy'

export default function StocksSidebar() {
  return (
    <Card title="Stocks">
      <ul className="space-y-2 text-sm">
        {DUMMY_MARKET.map((s) => (
          <li key={s.symbol} className="flex justify-between border-t first:border-t-0 pt-1">
            <span>{s.symbol} - {s.name}</span>
            <span className={s.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {s.price.toFixed(2)} ({s.change >= 0 ? '+' : ''}{s.change}%)
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
