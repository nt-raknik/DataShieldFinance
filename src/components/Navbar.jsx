
export default function Navbar({ onNavigate, active }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">DataShield Finance</h1>
          <nav className="flex gap-3 text-sm">
            <button
              className={`px-3 py-1 rounded-full ${active === 'home' ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
              onClick={() => onNavigate('home')}
            >
              Inicio
            </button>
            <button
              className={`px-3 py-1 rounded-full ${active === 'portfolio' ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
              onClick={() => onNavigate('portfolio')}
            >
              Portafolios
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
