
export default function Card({ title, children, right }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  )
}
