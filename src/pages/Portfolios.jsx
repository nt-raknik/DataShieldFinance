
import Card from '../components/Card'
import PortfolioTable from '../components/PortfolioTable'
import DonutChart from '../components/DonutChart'
import { DUMMY } from '../services/dummy'
import StocksSidebar from '../components/StocksSidebar'
import { useMemo, useState } from 'react'

export default function Portfolios() {
  const [selected, setSelected] = useState(1)
  const rows = DUMMY.holdingsByPortfolio[selected] ?? []
  const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0)
      return m
    }, {})
    return Object.entries(byType).map(([label, value]) => ({ label, value }))
  }, [rows])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {DUMMY.portfolios.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`px-3 py-1 rounded-full border ${selected === p.id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
        <Card title="My Portfolio">
          <PortfolioTable rows={rows} />
        </Card>
        <Card title="Graph (dummy)">
          <DonutChart series={series} />
        </Card>
        <StocksSidebar />
      </div>
    </div>
  )
}
