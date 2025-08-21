const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getAssetPerformance } = require("../services/performance");
const { noticias, marketNews } = require("../services/financial-data-client");

// 2. Consultar assets correspondientes a un portafolio
router.get("/noticias", async (req, res,next) => {

  //Api de ERik
  //console.log("Pruebas sobre las noticias de Erik");
  //const data = await noticias();
  //return res.json(data);
  //return getNoticias.noticias();

  //Api de Noel 
  console.log("Pruebas sobre las noticias de Noel");
  try {
    const news = await financialDataClient.marketNews("general");
    res.json(news);
  } catch (err) { next(err); }
});


// --- NUEVO: tipos válidos (si quieres usarlos en el front)
router.get("/types", async (_req, res) => {
  res.json(["stock","bond","crypto","fund","cash"]);
});

// --- NUEVO: listar assets (opcional filtro por tipo y/o búsqueda)
// GET /api/assets?type=stock
// GET /api/assets?q=aapl
// GET /api/assets?type=fund&q=vanguard
router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query;
    const params = [];
    let where = "WHERE 1=1";
    if (type) {
      where += " AND asset_type = ?";
      params.push(type);
    }
    if (q) {
      where += " AND (symbol LIKE ? OR name LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await pool.query(
      `
      SELECT asset_id, symbol, name, asset_type, currency, sector, created_at
      FROM assets
      ${where}
      ORDER BY symbol ASC
      LIMIT 500
      `,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// --- NUEVO: crear asset en el catálogo global
// POST /api/assets
// body: { symbol, name?, asset_type, currency, sector? }
router.post("/", async (req, res, next) => {
  try {
    let { symbol, name, asset_type, currency, sector } = req.body || {};
    if (!symbol || !asset_type || !currency) {
      return res.status(400).json({ error: "symbol, asset_type y currency son obligatorios" });
    }
    symbol = String(symbol).trim().toUpperCase();
    currency = String(currency).trim().toUpperCase();
    if (!name) name = symbol;

    const VALID = new Set(["stock","bond","crypto","fund","cash"]);
    if (!VALID.has(asset_type)) {
      return res.status(400).json({ error: "asset_type inválido" });
    }

    const [result] = await pool.query(
      `INSERT INTO assets (symbol, name, asset_type, currency, sector)
       VALUES (?, ?, ?, ?, ?)`,
      [symbol, name, asset_type, currency, sector || null]
    );

    res.status(201).json({
      asset_id: result.insertId,
      symbol, name, asset_type, currency, sector: sector || null
    });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El asset ya existe (symbol/currency)" });
    }
    next(err);
  }
});

// 2. Consultar assets correspondientes a un portafolio
router.get("/:portfolioId", async (req, res) => {
  console.log("Fetching assets for portfolio:", req.params.portfolioId);
  const [rows] = await pool.query(
    `SELECT DISTINCT a.* 
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [req.params.portfolioId]
  );
  res.json(rows);
});

// 5. Agregar asset a un portafolio (via transacción BUY)
router.post("/add", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'buy', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset added to portfolio" });
});

// 6. Eliminar asset de un portafolio (via transacción SELL)
router.post("/remove", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'sell', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset removed (sell transaction created)" });
});

// 7a. Performance de un asset
router.get("/:portfolioId/:assetId/performance", async (req, res) => {
  const { portfolioId, assetId } = req.params;
  try {
    const result = await getAssetPerformance(portfolioId, assetId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating asset performance" });
  }
});



module.exports = router;
