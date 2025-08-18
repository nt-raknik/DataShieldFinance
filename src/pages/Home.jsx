
import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'
import Assets_req from '../components/Assets_req' // Assuming Assets_req is a component that fetches and displays assets  
export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
      <Card title="Bienvenido(a)" right={<span className="text-xs text-neutral-500">Explore your portfolio</span>}>
        <p className="text-sm text-neutral-600">
          Go to <strong>Portfolios</strong> to review your positions. On the Home page, you'll find Mexican financial news and a dummy watchlist.
        </p>
      </Card>
      <NewsWidget />
      <StocksSidebar />
      <Assets_req />
    </div>
  )
}
