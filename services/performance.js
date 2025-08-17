const pool = require("../db");
const axios = require("axios");

// Calcular PnL de un asset en un portafolio
async function getAssetPerformance(portfolioId, assetId) {
  const [[asset]] = await pool.query("SELECT * FROM assets WHERE asset_id = ?", [assetId]);
  const [transactions] = await pool.query(
    "SELECT * FROM transactions WHERE portfolio_id = ? AND asset_id = ? ORDER BY date ASC",
    [portfolioId, assetId]
  );

  if (!asset || transactions.length === 0) {
    return { error: "No transactions found for asset" };
  }

  // Obtener precios desde API externa
  const { data } = await axios.get(`https://caramelo/default/cachedPriceData?ticker=${asset.symbol}`);
  const prices = data.price_data;

  // Calcular PnL acumulado día a día
  let position = 0;
  let cashFlow = 0;
  const history = prices.timestamp.map((ts, i) => {
    const date = new Date(ts * 1000).toISOString().split("T")[0];

    // Procesar transacciones en esa fecha
    transactions.forEach(tx => {
      if (tx.date.toISOString().split("T")[0] === date) {
        if (tx.type === "buy") {
          position += Number(tx.quantity);
          cashFlow -= tx.quantity * tx.price;
        }
        if (tx.type === "sell") {
          position -= Number(tx.quantity);
          cashFlow += tx.quantity * tx.price;
        }
      }
    });

    const marketValue = position * prices.close[i];
    const pnl = marketValue + cashFlow;

    return { date, pnl, marketValue, position };
  });

  return {
    ticker: asset.symbol,
    history
  };
}

// Calcular PnL de un portafolio completo
async function getPortfolioPerformance(portfolioId) {
  const [assets] = await pool.query(
    `SELECT DISTINCT a.asset_id, a.symbol
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [portfolioId]
  );

  let portfolioHistory = {};

  for (const asset of assets) {
    const result = await getAssetPerformance(portfolioId, asset.asset_id);

    result.history.forEach(h => {
      if (!portfolioHistory[h.date]) {
        portfolioHistory[h.date] = 0;
      }
      portfolioHistory[h.date] += h.pnl;
    });
  }

  const history = Object.entries(portfolioHistory).map(([date, pnl]) => ({
    date,
    pnl
  }));

  return { portfolioId, history };
}

module.exports = { getAssetPerformance, getPortfolioPerformance };
