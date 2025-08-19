const pool = require("../db");
const axios = require("axios");

// Helpers
const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const toNumOrNull = (v) => (isFiniteNum(v) ? Number(v) : null);
const toNumOrZero = (v) => (isFiniteNum(v) ? Number(v) : 0);
const toISODate = (ts) => {
  // Espera 'YYYY-MM-DD HH:mm:ss'
  if (typeof ts === "string") return ts.split(" ")[0];
  // Si viniera epoch ms/seg:
  try {
    const d = new Date(Number(ts));
    if (!isNaN(d)) return d.toISOString().split("T")[0];
  } catch (_) {}
  return null;
};

// PnL por asset
async function getAssetPerformance(portfolioId, assetId) {
  // 1) Asset y transacciones
  const [[asset]] = await pool.query(
    "SELECT * FROM assets WHERE asset_id = ?",
    [assetId]
  );
  const [transactions] = await pool.query(
    "SELECT * FROM transactions WHERE portfolio_id = ? AND asset_id = ? ORDER BY date ASC",
    [portfolioId, assetId]
  );

  if (!asset || transactions.length === 0) {
    return { error: "No transactions found for asset" };
  }

  // 2) API de precios (estructura con price_data)
  let priceData;
  try {
    const resp = await axios.get(
      `https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=${asset.symbol}`
    );
    const data = resp.data || {};
    if (!data.price_data || typeof data.price_data !== "object") {
      return { error: `Price data missing for ${asset.symbol}` };
    }
    priceData = data.price_data;
  } catch (e) {
    return { error: `Price API error for ${asset?.symbol || assetId}: ${e.message}` };
  }

  // 3) Validar arrays
  const { low, open, high, close, volume, timestamp } = priceData;
  const arraysOk =
    Array.isArray(timestamp) &&
    Array.isArray(open) &&
    Array.isArray(high) &&
    Array.isArray(low) &&
    Array.isArray(close) &&
    Array.isArray(volume);

  if (!arraysOk) {
    return { error: `Malformed OHLCV arrays for ${asset.symbol}` };
  }

  // Cortar a la menor longitud si hay desfases
  const len = Math.min(
    timestamp.length,
    open.length,
    high.length,
    low.length,
    close.length,
    volume.length
  );
  if (len === 0) {
    return { error: `Empty price series for ${asset.symbol}` };
  }

  // 4) PnL barra a barra (sanear NaN / nulos)
  let position = 0;
  let cashFlow = 0;

  const history = [];
  for (let i = 0; i < len; i++) {
    const ts = timestamp[i];
    const date = toISODate(ts);
    if (!date) continue; // si el timestamp viene roto, se salta

    // Aplicar transacciones del mismo día
    // Nota: si tus transacciones están en TZ local, ajusta aquí.
    for (const tx of transactions) {
      const txDate = tx.date.toISOString().split("T")[0];
      if (txDate === date) {
        const qty = Number(tx.quantity);
        const px = Number(tx.price);
        if (tx.type === "buy") {
          position += qty;
          cashFlow -= qty * px;
        } else if (tx.type === "sell") {
          position -= qty;
          cashFlow += qty * px;
        }
      }
    }

    const o = toNumOrNull(open[i]);
    const h = toNumOrNull(high[i]);
    const l = toNumOrNull(low[i]);
    const c = toNumOrNull(close[i]);
    const v = toNumOrZero(volume[i]);

    let marketValue = 0;
    let pnl = cashFlow;

    if (c !== null) {
      marketValue = position * c;
      pnl = marketValue + cashFlow;
    }

    history.push({
      date,
      ohlcv: { open: o, high: h, low: l, close: c, volume: v },
      pnl,
      marketValue,
      position,
    });
  }

  if (history.length === 0) {
    return { error: `No usable bars for ${asset.symbol}` };
  }

  return {
    ticker: asset.symbol,
    history,
  };
}

// Agregado de portafolio por día
async function getPortfolioPerformance(portfolioId) {
  const [assets] = await pool.query(
    `SELECT DISTINCT a.asset_id, a.symbol
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [portfolioId]
  );

  const perDay = Object.create(null);

  for (const asset of assets) {
    const result = await getAssetPerformance(portfolioId, asset.asset_id);
    if (!result || result.error || !Array.isArray(result.history)) continue;

    for (const h of result.history) {
      if (!perDay[h.date]) {
        perDay[h.date] = {
          open: null,
          high: -Infinity,
          low: Infinity,
          close: null,
          volume: 0,
          pnl: 0,
          marketValue: 0,
        };
      }
      const acc = perDay[h.date];

      // open: tomar el primero válido del día
      if (acc.open === null && isFiniteNum(h.ohlcv.open)) {
        acc.open = h.ohlcv.open;
      }
      // high / low: max/min válidos
      if (isFiniteNum(h.ohlcv.high)) acc.high = Math.max(acc.high, h.ohlcv.high);
      if (isFiniteNum(h.ohlcv.low)) acc.low = Math.min(acc.low, h.ohlcv.low);

      // close: usar el último válido encontrado
      if (isFiniteNum(h.ohlcv.close)) acc.close = h.ohlcv.close;

      // volumen
      if (isFiniteNum(h.ohlcv.volume)) acc.volume += h.ohlcv.volume;

      // PnL y MV: sumar si hay valor numérico
      if (isFiniteNum(h.pnl)) acc.pnl += h.pnl;
      if (isFiniteNum(h.marketValue)) acc.marketValue += h.marketValue;
    }
  }

  const history = Object.entries(perDay)
    .map(([date, v]) => ({
      date,
      ohlcv: {
        open: v.open,
        high: v.high === -Infinity ? null : v.high,
        low: v.low === Infinity ? null : v.low,
        close: v.close,
        volume: v.volume,
      },
      pnl: v.pnl,
      marketValue: v.marketValue,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { portfolioId, history };
}

module.exports = { getAssetPerformance, getPortfolioPerformance };
