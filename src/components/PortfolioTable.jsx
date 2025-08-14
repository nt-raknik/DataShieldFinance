
export default function PortfolioTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500">
            <th className="py-2">Ticker</th>
            <th className="py-2">Tipo</th>
            <th className="py-2 text-right">Cantidad</th>
            <th className="py-2 text-right">Precio Prom.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id} className="border-t">
              <td className="py-2 font-medium">{h.ticker}</td>
              <td className="py-2">{h.type}</td>
              <td className="py-2 text-right">{h.quantity}</td>
              <td className="py-2 text-right">{h.avg_price ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
