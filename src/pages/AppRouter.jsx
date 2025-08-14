
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Portfolios from './Portfolios'
import Navbar from '../components/Navbar'

export default function AppRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/portfolios' ? 'portfolio' : 'home'

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Navbar
        active={active}
        onNavigate={(p) => navigate(p === 'portfolio' ? '/portfolios' : '/')}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolios" element={<Portfolios />} />
        </Routes>
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-6 text-xs text-neutral-500">
        © DataShield Finance — Prototipo v0
      </footer>
    </div>
  )
}
