
export default function DonutChart({ series }) {
  const total = series.reduce((a, b) => a + b.value, 0)
  return (
    <div className="border rounded-xl p-4 text-sm">
      <div className="mb-2 font-medium">Total posiciones: {total}</div>
      <ul className="space-y-1">
        {series.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-neutral-300 inline-block"></span>
            {s.label}: <span className="font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
