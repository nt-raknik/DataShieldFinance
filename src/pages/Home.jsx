
import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
      <Card title="Bienvenido(a)" right={<span className="text-xs text-neutral-500">Explora tu portafolio</span>}>
        <p className="text-sm text-neutral-600">
          Ve a <strong>Portafolios</strong> para revisar tus posiciones. En Inicio encontrarás noticias financieras de México y un watchlist dummy.
        </p>
      </Card>
      <NewsWidget />
      <StocksSidebar />
    </div>
  )
}
