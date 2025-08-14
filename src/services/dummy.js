
export const DUMMY = {
  portfolios: [
    { id: 1, name: 'Mi Portafolio' },
    { id: 2, name: 'Crecimiento 60/40' },
  ],
  holdingsByPortfolio: {
    1: [
      { id: 1, ticker: 'AAPL', type: 'STOCK', name: 'Apple Inc.', quantity: 10, avg_price: 190 },
      { id: 2, ticker: 'TBILL', type: 'BOND', name: 'US T-Bill 3M', quantity: 5000, avg_price: 1 },
      { id: 3, ticker: 'MXN', type: 'CASH', name: 'Cash (MXN)', quantity: 15000, avg_price: null },
    ],
    2: [
      { id: 4, ticker: 'MSFT', type: 'STOCK', name: 'Microsoft', quantity: 6, avg_price: 410 },
      { id: 5, ticker: 'IEF', type: 'BOND', name: 'UST 7-10Y ETF', quantity: 12, avg_price: 95 },
      { id: 6, ticker: 'USD', type: 'CASH', name: 'Cash (USD)', quantity: 800, avg_price: null },
    ],
  },
}

export const DUMMY_MARKET = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 192.33, change: +0.84 },
  { symbol: 'MSFT', name: 'Microsoft', price: 414.12, change: -1.12 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 167.8, change: +0.35 },
  { symbol: 'AMZN', name: 'Amazon', price: 182.02, change: +2.1 },
  { symbol: 'TSLA', name: 'Tesla', price: 202.7, change: -0.9 },
]

export const DUMMY_NEWS_MX = [
  { title: 'Banxico mantiene tasa; mercado espera guía para 2025', url: '#', source: 'Economía MX', published_at: '2025-08-01T14:30:00Z' },
  { title: 'BMV cierra con ganancias; impulso en industriales', url: '#', source: 'Mercados Hoy', published_at: '2025-08-02T10:05:00Z' },
  { title: 'Peso se fortalece frente al dólar previo a datos de inflación', url: '#', source: 'Finanzas MX', published_at: '2025-08-03T09:00:00Z' },
]
